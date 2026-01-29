import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { ensureDriverUser, ensureGuardianUser } from "@/lib/user-accounts";
import { normalizeCpfOrKeep } from "@/lib/cpf";
import { isBcryptHash, verifyPassword } from "@/lib/password";
import { logTelemetryEvent } from "@/lib/telemetry";
import { maskCpf } from "@/lib/sanitizers";
import { signMobileToken } from "@/lib/mobile-jwt";
import {
  cpfSearchConditions,
  requireMobileApiKey,
  sanitizeRole,
} from "../shared";

const DEFAULT_PASSWORD = process.env.DEFAULT_USER_PASSWORD || "senha123";

export async function POST(request: Request) {
  const unauthorized = requireMobileApiKey(request, "login");
  if (unauthorized) return unauthorized;

  let body: any;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const cpfInput = typeof body.cpf === "string" ? body.cpf.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = sanitizeRole(body.role);
  const maskedCpf = maskCpf(cpfInput);
  const roleStatus = role ? "valid" : body.role ? "invalid" : "missing";

  if (!cpfInput || !password || !role) {
    logTelemetryEvent("MobileLoginFailure", {
      cpfMasked: maskedCpf,
      role: role ?? "UNKNOWN",
      reason: "missing_fields",
      hasCpf: Boolean(cpfInput),
      hasPassword: Boolean(password),
      roleStatus,
    });
    return NextResponse.json(
      { error: "CPF, senha e perfil são obrigatórios." },
      { status: 400 },
    );
  }

  if (role === "DRIVER") {
    return authenticateDriver(cpfInput, password, maskedCpf);
  }

  return authenticateGuardian(cpfInput, password, maskedCpf);
}

function describePasswordHash(hash?: string | null) {
  if (!hash) return "missing";
  return isBcryptHash(hash) ? "bcrypt" : "legacy";
}

async function authenticateDriver(
  cpfInput: string,
  password: string,
  maskedCpf: string,
) {
  const conditions = cpfSearchConditions(cpfInput);
  if (conditions.length === 0) {
    logTelemetryEvent("MobileLoginFailure", {
      cpfMasked: maskedCpf,
      role: "DRIVER",
      reason: "cpf_not_searchable",
    });
    return NextResponse.json({ error: "Motorista não encontrado." }, { status: 404 });
  }

  const driver = await prisma.driver.findFirst({
    where: { OR: conditions },
    include: { user: true },
  });

  if (!driver) {
    logTelemetryEvent("MobileLoginFailure", {
      cpfMasked: maskedCpf,
      role: "DRIVER",
      reason: "driver_not_found",
    });
    return NextResponse.json({ error: "Motorista não encontrado." }, { status: 404 });
  }

  const matches = await verifyPassword(password, driver.user?.password, DEFAULT_PASSWORD);
  if (!matches) {
    logTelemetryEvent("MobileLoginFailure", {
      cpfMasked: maskedCpf,
      role: "DRIVER",
      reason: "invalid_password",
      hasUserAccount: Boolean(driver.userId),
      passwordHashType: describePasswordHash(driver.user?.password),
      hasEmail: Boolean(driver.email),
    });
    return NextResponse.json({ error: "Senha inválida." }, { status: 401 });
  }

  await ensureDriverUser(
    {
      cpf: driver.cpf,
      name: driver.name,
      email: driver.email,
      userId: driver.userId,
    },
    { password },
  );

  const refreshedDriver = await prisma.driver.findUnique({
    where: { cpf: driver.cpf },
    select: { userId: true },
  });
  const token = refreshedDriver?.userId
    ? await signMobileToken({
        userId: refreshedDriver.userId,
        role: "DRIVER",
        cpf: normalizeCpfOrKeep(driver.cpf),
      })
    : null;

  logTelemetryEvent("MobileLoginSuccess", {
    cpfMasked: maskedCpf,
    role: "DRIVER",
    hasUserAccount: Boolean(driver.userId),
    passwordHashType: describePasswordHash(driver.user?.password),
    usedDefaultPassword: password === DEFAULT_PASSWORD,
    hasEmail: Boolean(driver.email),
  });

  return NextResponse.json({
    role: "DRIVER",
    driver: {
      cpf: normalizeCpfOrKeep(driver.cpf),
      name: driver.name,
      phone: driver.phone,
      email: driver.email,
      address: driver.address,
      updatedAt: driver.updatedAt.toISOString(),
    },
    token,
    syncedAt: new Date().toISOString(),
  });
}

async function authenticateGuardian(
  cpfInput: string,
  password: string,
  maskedCpf: string,
) {
  const conditions = cpfSearchConditions(cpfInput);
  if (conditions.length === 0) {
    logTelemetryEvent("MobileLoginFailure", {
      cpfMasked: maskedCpf,
      role: "GUARDIAN",
      reason: "cpf_not_searchable",
    });
    return NextResponse.json(
      { error: "Responsável não encontrado." },
      { status: 404 },
    );
  }

  const guardian = await prisma.guardian.findFirst({
    where: { OR: conditions },
    include: { user: true },
  });

  if (!guardian) {
    logTelemetryEvent("MobileLoginFailure", {
      cpfMasked: maskedCpf,
      role: "GUARDIAN",
      reason: "guardian_not_found",
    });
    return NextResponse.json(
      { error: "Responsável não encontrado." },
      { status: 404 },
    );
  }

  const matches = await verifyPassword(password, guardian.user?.password, DEFAULT_PASSWORD);
  if (!matches) {
    logTelemetryEvent("MobileLoginFailure", {
      cpfMasked: maskedCpf,
      role: "GUARDIAN",
      reason: "invalid_password",
      hasUserAccount: Boolean(guardian.userId),
      passwordHashType: describePasswordHash(guardian.user?.password),
    });
    return NextResponse.json({ error: "Senha inválida." }, { status: 401 });
  }

  await ensureGuardianUser(
    {
      cpf: guardian.cpf,
      name: guardian.name,
      userId: guardian.userId,
    },
    { password },
  );

  const refreshedGuardian = await prisma.guardian.findUnique({
    where: { cpf: guardian.cpf },
    select: { userId: true },
  });
  const token = refreshedGuardian?.userId
    ? await signMobileToken({
        userId: refreshedGuardian.userId,
        role: "GUARDIAN",
        cpf: normalizeCpfOrKeep(guardian.cpf),
      })
    : null;

  logTelemetryEvent("MobileLoginSuccess", {
    cpfMasked: maskedCpf,
    role: "GUARDIAN",
    hasUserAccount: Boolean(guardian.userId),
    passwordHashType: describePasswordHash(guardian.user?.password),
    usedDefaultPassword: password === DEFAULT_PASSWORD,
  });

  return NextResponse.json({
    role: "GUARDIAN",
    guardian: {
      cpf: normalizeCpfOrKeep(guardian.cpf),
      name: guardian.name,
      kinship: guardian.kinship,
      birthDate: guardian.birthDate ? guardian.birthDate.toISOString() : null,
      spouseName: guardian.spouseName,
      address: guardian.address,
      mobile: guardian.mobile,
      landline: guardian.landline,
      workAddress: guardian.workAddress,
      workPhone: guardian.workPhone,
      updatedAt: guardian.updatedAt.toISOString(),
    },
    token,
    syncedAt: new Date().toISOString(),
  });
}

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { ensureDriverUser, ensureGuardianUser } from "@/lib/user-accounts";
import { normalizeCpf, normalizeCpfOrKeep } from "@/lib/cpf";
import { verifyPassword } from "@/lib/password";

const DEFAULT_PASSWORD = process.env.DEFAULT_USER_PASSWORD || "perueiro123";

function requireApiKey(request: Request) {
  const key = request.headers.get("x-api-key");
  if (!key || key !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function cpfSearchConditions(rawCpf: string) {
  const trimmed = rawCpf.trim();
  if (!trimmed) return [] as { cpf: string }[];

  const normalized = normalizeCpf(trimmed);
  const conditions = [{ cpf: trimmed }];
  if (normalized !== trimmed) {
    conditions.push({ cpf: normalized });
  }
  return conditions;
}

function sanitizeRole(role: unknown): "DRIVER" | "GUARDIAN" | null {
  if (typeof role !== "string") return null;
  const upper = role.trim().toUpperCase();
  return upper === "DRIVER" || upper === "GUARDIAN" ? upper : null;
}

export async function POST(request: Request) {
  const unauthorized = requireApiKey(request);
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

  if (!cpfInput || !password || !role) {
    return NextResponse.json(
      { error: "CPF, senha e perfil são obrigatórios." },
      { status: 400 },
    );
  }

  if (role === "DRIVER") {
    return authenticateDriver(cpfInput, password);
  }

  return authenticateGuardian(cpfInput, password);
}

async function authenticateDriver(cpfInput: string, password: string) {
  const conditions = cpfSearchConditions(cpfInput);
  if (conditions.length === 0) {
    return NextResponse.json({ error: "Motorista não encontrado." }, { status: 404 });
  }

  const driver = await prisma.driver.findFirst({
    where: { OR: conditions },
    include: { user: true },
  });

  if (!driver) {
    return NextResponse.json({ error: "Motorista não encontrado." }, { status: 404 });
  }

  const matches = await verifyPassword(password, driver.user?.password, DEFAULT_PASSWORD);
  if (!matches) {
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
    syncedAt: new Date().toISOString(),
  });
}

async function authenticateGuardian(cpfInput: string, password: string) {
  const conditions = cpfSearchConditions(cpfInput);
  if (conditions.length === 0) {
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
    return NextResponse.json(
      { error: "Responsável não encontrado." },
      { status: 404 },
    );
  }

  const matches = await verifyPassword(password, guardian.user?.password, DEFAULT_PASSWORD);
  if (!matches) {
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
    syncedAt: new Date().toISOString(),
  });
}

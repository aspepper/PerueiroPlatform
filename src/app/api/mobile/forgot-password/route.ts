import { NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { ensureDriverUser, ensureGuardianUser } from "@/lib/user-accounts";
import { logTelemetryEvent } from "@/lib/telemetry";
import { maskCpf, maskEmail } from "@/lib/sanitizers";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { logApiError } from "@/lib/error";
import { cpfSearchConditions, requireMobileApiKey } from "../shared";

const TOKEN_EXPIRATION_MS = 1000 * 60 * 60;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function emailsMatch(input: string, candidate?: string | null) {
  if (!candidate) return false;
  return candidate.trim().toLowerCase() === input;
}

async function refreshDriver(cpf: string) {
  return prisma.driver.findUnique({ where: { cpf }, include: { user: true } });
}

async function refreshGuardian(cpf: string) {
  return prisma.guardian.findUnique({ where: { cpf }, include: { user: true } });
}

export async function POST(request: Request) {
  const unauthorized = requireMobileApiKey(request, "forgot-password");
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
  const emailInput = typeof body.email === "string" ? body.email.trim() : "";
  const maskedCpf = maskCpf(cpfInput);
  const maskedEmail = maskEmail(emailInput);

  logTelemetryEvent("MobileForgotPasswordRequested", {
    cpfMasked: maskedCpf,
    emailMasked: maskedEmail,
  });

  if (!cpfInput || !emailInput) {
    logTelemetryEvent("MobileForgotPasswordFailure", {
      cpfMasked: maskedCpf,
      emailMasked: maskedEmail,
      reason: "missing_fields",
      hasCpf: Boolean(cpfInput),
      hasEmail: Boolean(emailInput),
    });
    return NextResponse.json(
      { error: "CPF e e-mail são obrigatórios." },
      { status: 400 },
    );
  }

  const conditions = cpfSearchConditions(cpfInput);
  if (conditions.length === 0) {
    logTelemetryEvent("MobileForgotPasswordFailure", {
      cpfMasked: maskedCpf,
      emailMasked: maskedEmail,
      reason: "cpf_not_searchable",
    });
    return NextResponse.json(
      { error: "Cadastro não encontrado." },
      { status: 404 },
    );
  }

  const normalizedEmail = normalizeEmail(emailInput);

  const driver = await prisma.driver.findFirst({
    where: { OR: conditions },
    include: { user: true },
  });

  if (driver) {
    const matchesDriverEmail = emailsMatch(normalizedEmail, driver.email);
    const matchesUserEmail = emailsMatch(normalizedEmail, driver.user?.email);

    if (matchesDriverEmail || matchesUserEmail) {
      if (!driver.userId || !matchesUserEmail) {
        await ensureDriverUser(
          {
            cpf: driver.cpf,
            name: driver.name,
            email: driver.email,
            userId: driver.userId,
          },
          {},
        );
        const refreshed = await refreshDriver(driver.cpf);
        if (!refreshed?.user) {
          logTelemetryEvent("MobileForgotPasswordFailure", {
            cpfMasked: maskedCpf,
            emailMasked: maskedEmail,
            reason: "driver_user_missing",
          });
          return NextResponse.json(
            { error: "Não foi possível processar a solicitação." },
            { status: 500 },
          );
        }
        return respondWithResetToken(request, {
          userId: refreshed.user.id,
          email: refreshed.user.email ?? emailInput,
          cpfMasked: maskCpf(refreshed.cpf),
          role: "DRIVER",
        });
      }

      if (!driver.user?.email) {
        logTelemetryEvent("MobileForgotPasswordFailure", {
          cpfMasked: maskedCpf,
          emailMasked: maskedEmail,
          reason: "driver_user_email_missing",
        });
        return NextResponse.json(
          { error: "Não foi possível processar a solicitação." },
          { status: 500 },
        );
      }

      return respondWithResetToken(request, {
        userId: driver.user.id,
        email: driver.user.email,
        cpfMasked: maskedCpf,
        role: "DRIVER",
      });
    }

    logTelemetryEvent("MobileForgotPasswordFailure", {
      cpfMasked: maskedCpf,
      emailMasked: maskedEmail,
      reason: "driver_email_mismatch",
      hasDriverEmail: Boolean(driver.email),
      hasUserAccount: Boolean(driver.userId),
    });
  }

  const guardian = await prisma.guardian.findFirst({
    where: { OR: conditions },
    include: { user: true },
  });

  if (guardian) {
    const matchesUserEmail = emailsMatch(normalizedEmail, guardian.user?.email);

    if (matchesUserEmail) {
      if (!guardian.userId) {
        await ensureGuardianUser(
          {
            cpf: guardian.cpf,
            name: guardian.name,
            userId: guardian.userId,
          },
          {},
        );
        const refreshed = await refreshGuardian(guardian.cpf);
        if (!refreshed?.user) {
          logTelemetryEvent("MobileForgotPasswordFailure", {
            cpfMasked: maskedCpf,
            emailMasked: maskedEmail,
            reason: "guardian_user_missing",
          });
          return NextResponse.json(
            { error: "Não foi possível processar a solicitação." },
            { status: 500 },
          );
        }
        return respondWithResetToken(request, {
          userId: refreshed.user.id,
          email: refreshed.user.email ?? emailInput,
          cpfMasked: maskCpf(refreshed.cpf),
          role: "GUARDIAN",
        });
      }

      if (!guardian.user?.email) {
        logTelemetryEvent("MobileForgotPasswordFailure", {
          cpfMasked: maskedCpf,
          emailMasked: maskedEmail,
          reason: "guardian_user_email_missing",
        });
        return NextResponse.json(
          { error: "Não foi possível processar a solicitação." },
          { status: 500 },
        );
      }

      return respondWithResetToken(request, {
        userId: guardian.user.id,
        email: guardian.user.email,
        cpfMasked: maskedCpf,
        role: "GUARDIAN",
      });
    }

    logTelemetryEvent("MobileForgotPasswordFailure", {
      cpfMasked: maskedCpf,
      emailMasked: maskedEmail,
      reason: "guardian_email_mismatch",
      hasUserAccount: Boolean(guardian.userId),
    });
  }

  logTelemetryEvent("MobileForgotPasswordFailure", {
    cpfMasked: maskedCpf,
    emailMasked: maskedEmail,
    reason: "account_not_found",
  });

  return NextResponse.json(
    { error: "Cadastro não encontrado." },
    { status: 404 },
  );
}

type ResetTokenParams = {
  userId: string;
  email: string;
  cpfMasked: string;
  role: "DRIVER" | "GUARDIAN";
};

async function respondWithResetToken(
  request: Request,
  params: ResetTokenParams,
) {
  const maskedEmail = maskEmail(params.email);

  await prisma.passwordResetToken.deleteMany({
    where: { userId: params.userId },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MS);

  const resetToken = await prisma.passwordResetToken.create({
    data: {
      token,
      userId: params.userId,
      expiresAt,
    },
  });

  logTelemetryEvent("MobileForgotPasswordTokenCreated", {
    cpfMasked: params.cpfMasked,
    emailMasked: maskedEmail,
    role: params.role,
    expiresAt,
  });

  try {
    await sendPasswordResetEmail(params.email, resetToken.token);
    logTelemetryEvent("MobileForgotPasswordEmailSent", {
      cpfMasked: params.cpfMasked,
      emailMasked: maskedEmail,
      role: params.role,
    });
  } catch (error) {
    await logApiError(request, error, "mobile-forgot-password:send-email", {
      cpfMasked: params.cpfMasked,
      emailMasked: maskedEmail,
      role: params.role,
    });
  }

  return NextResponse.json({
    message: "Se os dados estiverem corretos, enviaremos instruções para redefinir a senha.",
  });
}

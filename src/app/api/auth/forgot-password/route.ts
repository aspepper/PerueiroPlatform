import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { logTelemetryEvent } from "@/lib/telemetry";
import { maskEmail } from "@/lib/sanitizers";
import { logApiError } from "@/lib/error";
import { z } from "zod";
import crypto from "crypto";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);

  const parsed = forgotPasswordSchema.safeParse(json);
  if (!parsed.success) {
    logTelemetryEvent("ForgotPasswordFailure", {
      reason: "invalid_payload",
    });
    return NextResponse.json(
      { message: "Dados inválidos" },
      { status: 400 },
    );
  }

  const { email } = parsed.data;
  const maskedEmail = maskEmail(email);

  logTelemetryEvent("ForgotPasswordRequested", {
    emailMasked: maskedEmail,
  });

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    logTelemetryEvent("ForgotPasswordUserLocated", {
      emailMasked: maskedEmail,
      userId: user.id,
    });
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    const resetToken = await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    try {
      await sendPasswordResetEmail(email, resetToken.token);
      logTelemetryEvent("ForgotPasswordEmailQueued", {
        emailMasked: maskedEmail,
        tokenExpiresAt: resetToken.expiresAt,
      });
    } catch (error) {
      await logApiError(request, error, "forgot-password:send-email", {
        emailMasked: maskedEmail,
        userId: user.id,
      });
    }
  } else {
    logTelemetryEvent("ForgotPasswordUserNotFound", {
      emailMasked: maskedEmail,
    });
  }

  return NextResponse.json({ message: "Se o e-mail existir, enviaremos instruções para redefinir a senha." });
}

import nodemailer, { Transporter } from "nodemailer";

import { logTelemetryEvent } from "./telemetry";
import { maskEmail } from "./sanitizers";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_FROM = process.env.SMTP_FROM || "no-reply@perueiros.com";

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  if (!SMTP_HOST || !SMTP_PORT) {
    console.info(
      "[mailer] SMTP_HOST/SMTP_PORT ausentes. Os e-mails de redefinição serão apenas registrados no console.",
    );
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: SMTP_USER && SMTP_PASSWORD ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
  });

  return cachedTransporter;
}

function getAppBaseUrl() {
  return (
    process.env.PERUEIRO_APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${getAppBaseUrl()}/reset-password/${token}`;
  const subject = "Redefinição de senha - Perueiro";
  const text = `Olá!\n\nRecebemos um pedido para redefinir a senha da sua conta no Perueiro. ` +
    `Use o link abaixo para criar uma nova senha.\n\n${resetUrl}\n\n` +
    "Se você não solicitou essa alteração, ignore este e-mail.";
  const html = `
    <p>Olá!</p>
    <p>Recebemos um pedido para redefinir a senha da sua conta no Perueiro.</p>
    <p>
      Use o link abaixo para criar uma nova senha:<br />
      <a href="${resetUrl}">${resetUrl}</a>
    </p>
    <p>Se você não solicitou essa alteração, ignore este e-mail.</p>
  `;

  const transporter = getTransporter();
  const maskedRecipient = maskEmail(to);

  logTelemetryEvent("PasswordResetEmailPrepared", {
    emailMasked: maskedRecipient,
    hasTransporter: Boolean(transporter),
  });

  if (!transporter) {
    console.info("[mailer] Envio de e-mail simulado:", { to, subject, text });
    logTelemetryEvent("PasswordResetEmailSimulated", {
      emailMasked: maskedRecipient,
    });
    return;
  }

  const transportOptions = transporter.options as {
    host?: string;
    port?: number;
    auth?: unknown;
  };

  try {
    await transporter.sendMail({
      to,
      from: SMTP_FROM,
      subject,
      text,
      html,
    });
    logTelemetryEvent("PasswordResetEmailSent", {
      emailMasked: maskedRecipient,
      smtpHost: transportOptions.host,
      smtpPort: transportOptions.port,
      hasAuth: Boolean(transportOptions.auth),
    });
  } catch (error) {
    logTelemetryEvent("PasswordResetEmailFailed", {
      emailMasked: maskedRecipient,
      smtpHost: transportOptions.host,
      smtpPort: transportOptions.port,
      errorName: error instanceof Error ? error.name : typeof error,
    });
    throw error;
  }
}

export function getMailerTransporter() {
  return getTransporter();
}

export function getAppBaseUrlForEmails() {
  return getAppBaseUrl();
}

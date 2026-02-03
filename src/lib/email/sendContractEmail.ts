import { logTelemetryEvent } from "@/lib/telemetry";
import { maskEmail } from "@/lib/sanitizers";
import { getAppBaseUrlForEmails, getMailerTransporter } from "@/lib/mailer";

const SMTP_FROM = process.env.SMTP_FROM || "no-reply@perueiros.com";

export async function sendContractEmail(to: string, token: string) {
  const baseUrl = getAppBaseUrlForEmails();
  const contractUrl = `${baseUrl}/contract/${token}`;
  const subject = "Contrato de transporte escolar - Perueiro";
  const text = `Olá!\n\nSeu contrato de transporte escolar já está disponível. ` +
    `Acesse o link abaixo para visualizar e assinar:\n\n${contractUrl}\n\n` +
    "Se você não reconhece este contrato, ignore este e-mail.";
  const html = `
    <p>Olá!</p>
    <p>Seu contrato de transporte escolar já está disponível.</p>
    <p>
      Acesse o link abaixo para visualizar e assinar:<br />
      <a href="${contractUrl}">${contractUrl}</a>
    </p>
    <p>Se você não reconhece este contrato, ignore este e-mail.</p>
  `;

  const transporter = getMailerTransporter();
  const maskedRecipient = maskEmail(to);

  logTelemetryEvent("ContractEmailPrepared", {
    emailMasked: maskedRecipient,
    hasTransporter: Boolean(transporter),
  });

  if (!transporter) {
    console.info("[mailer] Envio de e-mail simulado:", { to, subject, text });
    logTelemetryEvent("ContractEmailSimulated", {
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
    logTelemetryEvent("ContractEmailSent", {
      emailMasked: maskedRecipient,
      smtpHost: transportOptions.host,
      smtpPort: transportOptions.port,
      hasAuth: Boolean(transportOptions.auth),
    });
  } catch (error) {
    logTelemetryEvent("ContractEmailFailed", {
      emailMasked: maskedRecipient,
      smtpHost: transportOptions.host,
      smtpPort: transportOptions.port,
      errorName: error instanceof Error ? error.name : typeof error,
    });
    throw error;
  }
}

import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { telemetryClient } from "./app-insights";

type ErrorMetadata = Record<string, unknown>;

export interface LoggedError {
  errorId: string;
  context: string;
  timestamp: string;
}

const MAX_LOG_VALUE_LENGTH = 2048;

function ensureError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error(String(error));
  }
}

function truncate(value: string, maxLength = MAX_LOG_VALUE_LENGTH): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}…`;
}

function safeStringify(value: unknown, maxLength = MAX_LOG_VALUE_LENGTH): string {
  if (typeof value === "string") {
    return truncate(value, maxLength);
  }

  try {
    const serialized = JSON.stringify(value);
    return truncate(serialized, maxLength);
  } catch (error) {
    return `<<não serializável: ${
      error instanceof Error ? error.message : String(error)
    }>>`;
  }
}

async function flushTelemetry() {
  const client = telemetryClient;
  if (!client) {
    return;
  }

  await new Promise<void>((resolve) => {
    client.flush({
      isAppCrashing: false,
      callback: () => resolve(),
    });
  });
}

function buildTelemetryProperties(
  context: string,
  errorId: string,
  metadata: ErrorMetadata,
) {
  const properties: Record<string, string> = { context, errorId };

  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined) continue;
    properties[`meta_${key}`] = safeStringify(value);
  }

  return properties;
}

async function readRequestBody(request: Request): Promise<unknown | undefined> {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD") {
    return undefined;
  }

  if (request.bodyUsed) {
    return "<<corpo já consumido antes do log>>";
  }

  try {
    const clone = request.clone();
    const rawBody = await clone.text();
    if (!rawBody) {
      return undefined;
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        return JSON.parse(rawBody);
      } catch {
        return `<<JSON inválido>> ${truncate(rawBody)}`;
      }
    }

    return truncate(rawBody);
  } catch (error) {
    return `<<falha ao ler corpo: ${
      error instanceof Error ? error.message : String(error)
    }>>`;
  }
}

async function buildRequestMetadata(request: Request) {
  const headers: Record<string, string> = {};
  const relevantHeaders = [
    "x-request-id",
    "x-ms-request-id",
    "x-forwarded-for",
    "x-real-ip",
    "user-agent",
    "referer",
  ];

  for (const header of relevantHeaders) {
    const value = request.headers.get(header);
    if (value) {
      headers[header] = value;
    }
  }

  const metadata: Record<string, unknown> = {
    method: request.method,
    url: request.url,
  };

  if (Object.keys(headers).length > 0) {
    metadata.headers = headers;
  }

  const body = await readRequestBody(request);
  if (body !== undefined) {
    metadata.body = body;
  }

  return metadata;
}

export async function logError(
  error: unknown,
  context: string,
  metadata: ErrorMetadata = {},
): Promise<LoggedError> {
  const errorId = randomUUID();
  const timestamp = new Date().toISOString();
  const normalizedError = ensureError(error);

  try {
    console.error(`===== ERRO ${context} (${errorId}) =====`);
    console.error("Timestamp:", timestamp);
    console.error("Nome:", normalizedError.name);
    console.error("Mensagem:", normalizedError.message);
    if (normalizedError.stack) {
      console.error("Stack:", normalizedError.stack);
    }
    if (Object.keys(metadata).length > 0) {
      console.error("Metadados:", metadata);
    }
    if (!(error instanceof Error)) {
      console.error("Erro original:", error);
    }
    console.error("===================================");
  } catch (consoleError) {
    console.warn(
      "Falha ao registrar o erro no console:",
      consoleError instanceof Error ? consoleError.message : consoleError,
    );
  }

  if (telemetryClient) {
    try {
      telemetryClient.trackException({
        exception: normalizedError,
        properties: buildTelemetryProperties(context, errorId, metadata),
      });
      await flushTelemetry();
    } catch (telemetryError) {
      console.warn(
        "Falha ao enviar o erro para o Application Insights:",
        telemetryError instanceof Error
          ? telemetryError.message
          : telemetryError,
      );
    }
  }

  return { errorId, context, timestamp };
}

export async function logApiError(
  request: Request,
  error: unknown,
  context: string,
  extraMetadata: ErrorMetadata = {},
) {
  const requestMetadata = await buildRequestMetadata(request);
  return logError(error, context, { ...extraMetadata, request: requestMetadata });
}

export async function errorResponse(
  request: Request,
  error: unknown,
  context: string,
) {
  const { errorId } = await logApiError(request, error, context);
  return NextResponse.json(
    {
      message:
        "Ocorreu um erro no servidor. Por favor, tente novamente mais tarde.",
      errorId,
    },
    { status: 500 },
  );
}

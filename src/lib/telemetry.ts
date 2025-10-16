import { telemetryClient } from "./app-insights";

const MAX_PROPERTY_LENGTH = 1024;

function truncate(value: string, maxLength = MAX_PROPERTY_LENGTH): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}…`;
}

function normalizeValue(value: unknown): string {
  if (value === null) {
    return "null";
  }

  if (value === undefined) {
    return "undefined";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return truncate(value);
  }

  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }

  try {
    return truncate(JSON.stringify(value));
  } catch (error) {
    return `<<não serializável: ${
      error instanceof Error ? error.message : String(error)
    }>>`;
  }
}

function buildProperties(properties: Record<string, unknown>) {
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (value === undefined) continue;
    normalized[key] = normalizeValue(value);
  }

  return normalized;
}

export function logTelemetryEvent(
  name: string,
  properties: Record<string, unknown> = {},
  measurements?: Record<string, number>,
) {
  try {
    const normalizedProperties = buildProperties(properties);

    console.info(`[telemetry:event] ${name}`, normalizedProperties);

    if (!telemetryClient) {
      return;
    }

    telemetryClient.trackEvent({ name, properties: normalizedProperties, measurements });
  } catch (error) {
    console.warn(
      "Falha ao registrar evento de telemetria:",
      error instanceof Error ? error.message : error,
    );
  }
}

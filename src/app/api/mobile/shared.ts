import { NextResponse } from "next/server";

import { cpfSearchValues } from "@/lib/cpf";
import { logTelemetryEvent } from "@/lib/telemetry";

export type MobileRole = "DRIVER" | "GUARDIAN";

export function requireMobileApiKey(request: Request, context: string) {
  const key = request.headers.get("x-api-key");
  if (!key || key !== process.env.NEXTAUTH_SECRET) {
    logTelemetryEvent("MobileApiUnauthorized", {
      context,
      hasKey: Boolean(key),
      keyLength: key?.length ?? 0,
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function cpfSearchConditions(rawCpf: string) {
  return cpfSearchValues(rawCpf).map((cpf) => ({ cpf }));
}

export function sanitizeRole(role: unknown): MobileRole | null {
  if (typeof role !== "string") return null;
  const upper = role.trim().toUpperCase();
  return upper === "DRIVER" || upper === "GUARDIAN" ? upper : null;
}

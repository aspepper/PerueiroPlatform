export function normalizeCpf(value: string): string {
  return value.replace(/\D+/g, "");
}

export function normalizeCpfOrKeep(value: string): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  const normalized = normalizeCpf(trimmed);
  return normalized.length > 0 ? normalized : trimmed;
}

export function normalizeOptionalCpf(
  value: string | null | undefined,
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = normalizeCpf(trimmed);
  return normalized.length > 0 ? normalized : trimmed;
}

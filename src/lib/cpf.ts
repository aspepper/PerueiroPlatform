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

export function cpfSearchValues(rawCpf: string): string[] {
  if (typeof rawCpf !== "string") return [];

  const trimmed = rawCpf.trim();
  if (!trimmed) return [];

  const normalized = normalizeCpf(trimmed);
  const variations = new Set<string>();

  variations.add(trimmed);

  if (normalized) {
    variations.add(normalized);

    if (normalized.length === 11) {
      const formatted = normalized.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        "$1.$2.$3-$4",
      );
      variations.add(formatted);
    }
  }

  return Array.from(variations).filter((cpf) => cpf.length > 0);
}

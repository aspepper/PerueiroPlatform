const CPF_UNKNOWN = "desconhecido";

function repeat(char: string, times: number) {
  if (times <= 0) return "";
  return char.repeat(times);
}

export function maskCpf(rawCpf: string | null | undefined): string {
  if (!rawCpf) {
    return CPF_UNKNOWN;
  }

  const digits = rawCpf.replace(/\D+/g, "");
  if (!digits) {
    return CPF_UNKNOWN;
  }

  if (digits.length <= 2) {
    return `${repeat("*", digits.length)}${digits.slice(-1)}`;
  }

  if (digits.length <= 4) {
    return `${repeat("*", digits.length - 2)}${digits.slice(-2)}`;
  }

  const prefixLength = Math.min(3, digits.length - 2);
  const prefix = digits.slice(0, prefixLength);
  const suffix = digits.slice(-2);
  const hiddenLength = Math.max(1, digits.length - prefixLength - suffix.length);

  return `${prefix}${repeat("*", hiddenLength)}${suffix}`;
}

export function maskEmail(email: string | null | undefined): string {
  if (!email) {
    return "desconhecido";
  }

  const trimmed = email.trim();
  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 0) {
    return "desconhecido";
  }

  const localPart = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  if (!domain) {
    return "desconhecido";
  }

  const firstChar = localPart.charAt(0) || "*";
  const lastChar = localPart.charAt(localPart.length - 1) || "";
  const maskedLocal =
    localPart.length <= 2
      ? `${firstChar}***`
      : `${firstChar}***${lastChar}`;

  return `${maskedLocal}@${domain}`;
}

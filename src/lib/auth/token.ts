const HOURS_48_IN_MS = 48 * 60 * 60 * 1000;

export function createContractToken() {
  const token = crypto.randomUUID();
  const tokenExpiry = new Date(Date.now() + HOURS_48_IN_MS);

  return { token, tokenExpiry };
}

export function isTokenExpired(tokenExpiry: Date) {
  return Date.now() > tokenExpiry.getTime();
}

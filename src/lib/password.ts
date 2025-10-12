import bcrypt from "bcryptjs";

const BCRYPT_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export function isBcryptHash(value: string): boolean {
  return BCRYPT_REGEX.test(value);
}

export async function resolvePasswordHash(password: string, existingHash?: string) {
  if (isBcryptHash(password)) {
    return password;
  }

  if (existingHash) {
    const matches = await bcrypt.compare(password, existingHash);
    if (matches) {
      return existingHash;
    }
  }

  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  passwordAttempt: string,
  storedHash?: string | null,
  fallbackPassword?: string,
): Promise<boolean> {
  if (storedHash) {
    if (isBcryptHash(storedHash)) {
      if (await bcrypt.compare(passwordAttempt, storedHash)) {
        return true;
      }
    } else if (passwordAttempt === storedHash) {
      return true;
    }
  }

  if (!fallbackPassword) {
    return false;
  }

  if (passwordAttempt === fallbackPassword) {
    return true;
  }

  if (isBcryptHash(fallbackPassword)) {
    return bcrypt.compare(passwordAttempt, fallbackPassword);
  }

  return false;
}

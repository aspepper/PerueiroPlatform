import { SignJWT, jwtVerify } from "jose";

export type MobileTokenRole = "DRIVER" | "GUARDIAN";

export type MobileTokenPayload = {
  userId: string;
  role: MobileTokenRole;
  cpf: string;
};

const issuer = "perueiro-mobile";
const audience = "perueiro-mobile";

function resolveSecret() {
  const secret = process.env.MOBILE_JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("Missing MOBILE_JWT_SECRET or NEXTAUTH_SECRET for mobile JWT.");
  }
  return new TextEncoder().encode(secret);
}

export async function signMobileToken(payload: MobileTokenPayload) {
  const secret = resolveSecret();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .setIssuer(issuer)
    .setAudience(audience)
    .sign(secret);
}

export async function verifyMobileToken(request: Request): Promise<MobileTokenPayload | null> {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return null;

  try {
    const secret = resolveSecret();
    const { payload } = await jwtVerify(token, secret, { issuer, audience });
    if (
      typeof payload.userId === "string" &&
      typeof payload.role === "string" &&
      typeof payload.cpf === "string"
    ) {
      return {
        userId: payload.userId,
        role: payload.role as MobileTokenRole,
        cpf: payload.cpf,
      };
    }
    return null;
  } catch {
    return null;
  }
}

import { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolvePasswordHash } from "@/lib/password";
import { normalizeCpf } from "@/lib/cpf";

const DEFAULT_PASSWORD = process.env.DEFAULT_USER_PASSWORD || "perueiro123";
const DEFAULT_DOMAIN = process.env.DEFAULT_USER_DOMAIN || "perueiro.local";

function fallbackEmail(cpf: string, role: Role) {
  const prefix = role === "DRIVER" ? "motorista" : role === "GUARDIAN" ? "responsavel" : "usuario";
  const normalizedCpf = normalizeCpf(cpf) || cpf.trim();
  return `${prefix}.${normalizedCpf}@${DEFAULT_DOMAIN}`.toLowerCase();
}

function sanitizeEmail(input: unknown, fallback: string) {
  if (typeof input !== "string") return fallback;
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return fallback;
  if (!trimmed.includes("@")) return fallback;
  return trimmed;
}

async function ensureUserAssociation(
  params: {
    existingUserId: string | null;
    cpf: string;
    name: string;
    email: string | null;
    role: Role;
    linkUser: (userId: string) => Promise<void>;
  },
) {
  const email = sanitizeEmail(params.email, fallbackEmail(params.cpf, params.role));
  const existingUser = params.existingUserId
    ? await prisma.user.findUnique({ where: { id: params.existingUserId } })
    : await prisma.user.findUnique({ where: { email } });

  if (!existingUser) {
    const passwordHash = await resolvePasswordHash(DEFAULT_PASSWORD);
    const created = await prisma.user.create({
      data: {
        email,
        name: params.name,
        role: params.role,
        password: passwordHash,
      },
    });
    await params.linkUser(created.id);
    return created;
  }

  const updates: {
    email?: string;
    name?: string;
    role?: Role;
  } = {};

  if (existingUser.email !== email) {
    updates.email = email;
  }

  if ((params.name && existingUser.name !== params.name) || (!existingUser.name && params.name)) {
    updates.name = params.name;
  }

  if (existingUser.role !== params.role) {
    updates.role = params.role;
  }

  const user =
    Object.keys(updates).length > 0
      ? await prisma.user.update({ where: { id: existingUser.id }, data: updates })
      : existingUser;

  if (params.existingUserId !== user.id) {
    await params.linkUser(user.id);
  }

  return user;
}

export async function ensureDriverUser(driver: {
  cpf: string;
  name: string;
  email: string | null;
  userId: string | null;
}) {
  await ensureUserAssociation({
    existingUserId: driver.userId,
    cpf: driver.cpf,
    name: driver.name,
    email: driver.email,
    role: "DRIVER",
    linkUser: async (userId) => {
      await prisma.driver.update({ where: { cpf: driver.cpf }, data: { userId } });
    },
  });
}

export async function ensureGuardianUser(guardian: {
  cpf: string;
  name: string;
  userId: string | null;
}) {
  await ensureUserAssociation({
    existingUserId: guardian.userId,
    cpf: guardian.cpf,
    name: guardian.name,
    email: null,
    role: "GUARDIAN",
    linkUser: async (userId) => {
      await prisma.guardian.update({ where: { cpf: guardian.cpf }, data: { userId } });
    },
  });
}

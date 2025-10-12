import { prisma } from "@/lib/prisma";
import { AuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { resolvePasswordHash, verifyPassword } from "@/lib/password";

async function ensureAdminAccount() {
  const email = process.env.ADMIN_EMAIL || "admin@perueiro.local";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  const passwordHash = await resolvePasswordHash(password, existing?.password);

  if (!existing) {
    await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role: "ADMIN",
        name: "Administrador",
      },
    });
    return;
  }

  const updates: {
    password?: string;
    role?: "ADMIN";
    name?: string;
  } = {};

  if (existing.password !== passwordHash) {
    updates.password = passwordHash;
  }

  if (existing.role !== "ADMIN") {
    updates.role = "ADMIN";
  }

  if (!existing.name) {
    updates.name = "Administrador";
  }

  if (Object.keys(updates).length > 0) {
    await prisma.user.update({
      where: { id: existing.id },
      data: updates,
    });
  }
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await ensureAdminAccount();

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || user.role !== "ADMIN") {
          return null;
        }

        const passwordMatches = await verifyPassword(
          credentials.password,
          user.password,
          process.env.ADMIN_PASSWORD,
        );
        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? token.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string | undefined) ?? "";
      }

      return session;
    },
  },
};

export function getServerAuthSession() {
  return getServerSession(authOptions);
}

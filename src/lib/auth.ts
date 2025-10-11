<<<<<<< HEAD
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "ADMIN";
      email: string;
      name?: string | null;
    } & DefaultSession["user"];
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { auth, signIn, signOut, handlers } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      async authorize(creds) {
        const parsed = credentialsSchema.safeParse(creds);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        } as any;
      },
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.sub as string;
        (session.user as any).role = token.role as "ADMIN";
        session.user.email = token.email as string;
      }
      return session;
    },
    async signIn({ user }) {
      return (user as any)?.role === "ADMIN";
    },
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
});
=======
export type SessionUser = {
  id: string;
  name: string;
  role: "admin" | "operator";
};

export type Session = {
  user: SessionUser;
  issuedAt: string;
};

export async function auth(): Promise<Session> {
  // Em uma implementação real os dados viriam de um provider OAuth/NextAuth.
  // Mantemos um mock simples para permitir a renderização no ambiente de testes.
  return {
    user: {
      id: "admin-1",
      name: "Equipe Administrativa",
      role: "admin"
    },
    issuedAt: new Date().toISOString()
  };
}
>>>>>>> 3774d396c579c7b72ea4cfd9efccb2e2fe0aa137

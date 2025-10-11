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

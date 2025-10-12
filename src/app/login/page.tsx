"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";

const errorMessages: Record<string, string> = {
  CredentialsSignin: "E-mail ou senha inválidos. Confira os dados e tente novamente.",
  AccessDenied: "Você não tem permissão para acessar este painel.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-50" aria-busy="true" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const { status } = useSession();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const queryError = useMemo(() => {
    const errorParam = params?.get("error");
    if (!errorParam) return null;
    return errorMessages[errorParam] ?? "Não foi possível realizar o login. Tente novamente.";
  }, [params]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setFormError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.replace("/dashboard");
    } else if (result?.error) {
      setFormError(errorMessages[result.error] ?? "Não foi possível realizar o login. Tente novamente.");
    }

    setLoading(false);
  };

  const errorToDisplay = formError ?? queryError;

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#F5F7FB]">
      <div className="pointer-events-none absolute -left-40 -top-48 h-[320px] w-[320px] rounded-full bg-[#FFD54F]" aria-hidden />
      <div className="pointer-events-none absolute -bottom-48 -right-40 h-[360px] w-[360px] rounded-full bg-[#00D2D3]" aria-hidden />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
          <section className="flex flex-col justify-center rounded-[36px] border border-[#E5E7EB] bg-white px-10 py-12 shadow-[0_45px_80px_-45px_rgba(15,23,42,0.35)] sm:px-12 sm:py-14">
            <div className="flex items-center gap-6">
              <span className="inline-flex h-[136px] w-[120px] items-center justify-center">
                <svg
                  aria-hidden="true"
                  width="120"
                  height="136"
                  viewBox="0 0 120 136"
                  className="drop-shadow-[0_16px_30px_rgba(16,23,42,0.08)]"
                >
                  <path
                    d="M60 0C93.137 0 120 26.8635 120 60C120 97.5 60 136 60 136C60 136 0 97.5 0 60C0 26.8635 26.8635 0 60 0Z"
                    fill="#FFD54F"
                  />
                  <circle cx="50" cy="54" r="26" fill="#0F172A" />
                  <circle cx="74" cy="60" r="22" fill="#00D2D3" />
                  <circle cx="42" cy="42" r="6" fill="#00D2D3" />
                </svg>
              </span>
              <div className="space-y-2 text-slate-900">
                <h1 className="text-3xl font-semibold sm:text-[2rem]">Perueiros Admin</h1>
                <p className="text-base text-slate-500">Faça as coisas com carinho.</p>
              </div>
            </div>

            <p className="mt-8 max-w-lg text-base leading-relaxed text-slate-600">
              Cuidar da logística escolar é um ato de atenção. Administre rotas, motoristas e alunos com a mesma dedicação que
              eles recebem diariamente.
            </p>

            <ul className="mt-10 space-y-4 text-sm text-slate-600">
              {[
                "Cadastro de motoristas, alunos e escolas",
                "Gestão de pagamentos e recorrências",
                "Monitoramento de rotas e alertas em tempo real",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#101B3A] text-[0.85rem] text-[#FFD54F]">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex h-full flex-col justify-center rounded-[36px] border border-[#E5E7EB] bg-white px-8 py-12 shadow-[0_45px_80px_-45px_rgba(15,23,42,0.28)] sm:px-10">
            <header className="space-y-2">
              <h2 className="text-[2rem] font-semibold leading-tight text-slate-900">Bem-vindo de volta</h2>
              <p className="text-sm text-slate-500">Acesso reservado aos administradores.</p>
            </header>

            <form className="mt-10 space-y-6" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  E-mail
                </label>
                <input
                  id="email"
                  className="w-full rounded-2xl border border-[#CFD6E4] bg-white px-4 py-3 text-sm text-slate-700 shadow-[inset_0_2px_6px_rgba(15,23,42,0.05)] transition focus:border-[#101B3A] focus:outline-none focus:ring-4 focus:ring-[#101B3A]/10"
                  type="email"
                  placeholder="voce@perueiro.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Senha
                </label>
                <input
                  id="password"
                  className="w-full rounded-2xl border border-[#CFD6E4] bg-white px-4 py-3 text-sm text-slate-700 shadow-[inset_0_2px_6px_rgba(15,23,42,0.05)] transition focus:border-[#101B3A] focus:outline-none focus:ring-4 focus:ring-[#101B3A]/10"
                  type="password"
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              {errorToDisplay ? (
                <p className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#B91C1C]">
                  {errorToDisplay}
                </p>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#101B3A] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.8)] transition hover:bg-[#0B132D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101B3A]"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar →"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-xs font-medium text-slate-500">
              <button type="button" className="transition hover:text-slate-700">
                Esqueci minha senha
              </button>
              <button type="button" className="transition hover:text-slate-700">
                Precisa de ajuda?
              </button>
            </div>
          </section>
        </div>
      </div>

      <footer className="relative z-10 px-6 pb-8 text-center text-xs text-slate-500">
        © 2025 Perueiro. Todos os direitos reservados.
      </footer>
    </main>
  );
}

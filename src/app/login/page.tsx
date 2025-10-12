"use client";

import Image from "next/image";
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
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 py-12 lg:flex-row lg:items-center lg:justify-between">
        <section className="relative flex w-full flex-1 flex-col justify-center gap-10 overflow-hidden rounded-[32px] bg-white/60 px-10 py-14 shadow-[0_35px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl">
          <div className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-[#ffde59]" aria-hidden />
          <div className="pointer-events-none absolute left-32 top-6 h-24 w-24 rounded-3xl bg-white shadow-[0_25px_45px_rgba(255,222,89,0.35)]" aria-hidden />
          <div className="pointer-events-none absolute left-40 top-16 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0ea5e9] text-2xl text-white shadow-lg shadow-[#0ea5e9]/40" aria-hidden>
            🚌
          </div>
          <div className="pointer-events-none absolute -bottom-24 -right-36 h-80 w-80 rounded-full bg-[#7bdcf6]" aria-hidden />
          <div className="pointer-events-none absolute right-10 bottom-12 h-20 w-20 rotate-6 rounded-[32px] bg-white shadow-[0_30px_60px_-30px_rgba(14,165,233,0.65)]" aria-hidden />

          <div className="relative flex max-w-lg flex-col gap-6 text-slate-700">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Perueiros Admin</span>
            <h1 className="text-4xl font-semibold leading-[1.15] text-slate-900 sm:text-[2.75rem]">Faça as coisas com carinho.</h1>
            <p className="text-base text-slate-600">
              Cuidar da logística escolar é um ato de atenção. Administre motoristas, alunos e escolas com a mesma dedicação que eles recebem diariamente.
            </p>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9]">•</span>
                Gestão de motoristas, alunos e escolas
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9]">•</span>
                Gestão de pagamentos e recorrências
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9]">•</span>
                Monitoramento de rotas e alertas em tempo real
              </li>
            </ul>
            <footer className="text-sm font-medium text-slate-400">© 2025 Perueiros. Todos os direitos reservados.</footer>
          </div>
        </section>

        <section className="relative z-10 w-full max-w-md rounded-[32px] border border-white/70 bg-white px-10 py-12 shadow-[0_45px_90px_-50px_rgba(15,23,42,0.55)]">
          <div className="flex items-center gap-3">
            <Image src="/perueiro-logo.svg" alt="Logotipo Perueiro" width={48} height={60} className="h-12 w-auto" />
            <div>
              <h2 className="text-3xl font-semibold text-slate-900">Bem-vindo de volta</h2>
              <p className="text-sm text-slate-500">Acesso reservado aos administradores.</p>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                E-mail
              </label>
              <input
                id="email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-inner shadow-white/60 transition focus:border-[#0ea5e9] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0ea5e9]/20"
                type="email"
                placeholder="voce@perueiro.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Senha
              </label>
              <input
                id="password"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-inner shadow-white/60 transition focus:border-[#0ea5e9] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0ea5e9]/20"
                type="password"
                placeholder="Digite sua senha"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {errorToDisplay ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                {errorToDisplay}
              </p>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <button type="button" className="font-semibold text-cyan-700 hover:text-cyan-800">
              Esqueci minha senha
            </button>
            <button type="button" className="font-semibold text-slate-500 hover:text-slate-600">
              Precisa de ajuda?
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

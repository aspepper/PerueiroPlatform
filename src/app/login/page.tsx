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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:flex-row lg:items-center lg:justify-between">
        <section className="relative flex w-full flex-1 flex-col gap-10 overflow-hidden rounded-3xl border border-slate-200 bg-white px-8 py-12 shadow-xl shadow-slate-900/10">
          <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-amber-300/70" aria-hidden />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-cyan-200/60" aria-hidden />

          <div className="relative flex items-center gap-3 text-slate-700">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300 text-2xl text-slate-900 shadow-md shadow-amber-500/30">
              ✶
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-500">Perueiros Admin</span>
              <span className="text-lg font-semibold text-slate-900">Faça as coisas com carinho</span>
            </div>
          </div>

          <div className="relative space-y-5 text-slate-700">
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-[2.4rem]">Cuide da operação com atenção.</h1>
            <p className="max-w-xl text-base text-slate-500">
              Cuidar da logística escolar é um ato de atenção. Administre motoristas, alunos e escolas com a mesma dedicação que eles recebem diariamente.
            </p>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600">•</span>
                Gestão de motoristas, alunos e escolas
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600">•</span>
                Gestão de pagamentos e recorrências
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600">•</span>
                Monitoramento de rotas e alertas em tempo real
              </li>
            </ul>
          </div>

          <footer className="relative text-sm text-slate-400">© 2025 Perueiros. Todos os direitos reservados.</footer>
        </section>

        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-xl shadow-slate-900/10">
          <div className="flex items-center gap-3">
            <Image src="/perueiro-logo.svg" alt="Logotipo Perueiro" width={48} height={60} className="h-12 w-auto" />
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Bem-vindo de volta</h2>
              <p className="text-sm text-slate-500">Acesso reservado aos administradores.</p>
            </div>
          </div>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                E-mail
              </label>
              <input
                id="email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-inner shadow-white/60 focus:border-cyan-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-100"
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
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-inner shadow-white/60 focus:border-cyan-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-100"
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

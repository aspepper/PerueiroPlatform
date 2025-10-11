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
    <Suspense fallback={<main className="login-page" aria-busy="true" />}>
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
    <main className="login-page">
      <div className="login-wrapper">
        <section className="login-hero" aria-hidden="true">
          <div className="login-hero__logo">
            <Image src="/perueiro-logo.svg" alt="Perueiro" width={72} height={96} priority />
            <span>Perueiros Admin</span>
          </div>
          <div className="login-hero__content">
            <h1>Faça as coisas com carinho.</h1>
            <p>
              Cuidar da logística escolar é um ato de atenção. Entre para administrar rotas, motoristas e alunos com a
              mesma dedicação que eles recebem diariamente.
            </p>
          </div>
          <footer className="login-hero__footer">Acesso reservado para administradores.</footer>
        </section>

        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-panel__header">
            <Image src="/perueiro-logo.svg" alt="Logotipo Perueiro" width={54} height={72} className="login-panel__logo" />
            <div>
              <h2 id="login-title">Bem-vindo de volta</h2>
              <p>Entre com as credenciais de administrador para continuar.</p>
            </div>
          </div>

          <form className="login-form" onSubmit={onSubmit}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="voce@perueiro.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="password">Senha</label>
            <input
              id="password"
              className="input"
              type="password"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {errorToDisplay ? <p className="login-error">{errorToDisplay}</p> : null}

            <button type="submit" className="btn login-btn" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

function getErrorMessage(code?: string | null) {
  if (!code) {
    return null;
  }

  switch (code) {
    case "CredentialsSignin":
      return "Credenciais inválidas. Verifique seus dados.";
    default:
      return "Não foi possível acessar sua conta. Tente novamente.";
  }
}

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(getErrorMessage(result.error));
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-[13px] font-semibold text-[#334155]" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@perueiro.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-[12px] border border-[#CBD5E1] bg-white px-4 py-3 text-[14px] text-[#111827] outline-none ring-[#00D2D3]/20 transition focus:border-[#00D2D3] focus:ring-4"
          required
        />
      </div>
      <div>
        <label className="mb-2 block text-[13px] font-semibold text-[#334155]" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-[12px] border border-[#CBD5E1] bg-white px-4 py-3 text-[14px] text-[#111827] outline-none ring-[#FFD54F]/20 transition focus:border-[#FFD54F] focus:ring-4"
          required
        />
      </div>
      {error ? (
        <p className="text-[13px] font-semibold text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#0F1730] py-3 text-center text-[16px] font-extrabold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Entrando..." : "Entrar →"}
      </button>
      <hr className="my-2 border-[#E2E8F0]" />
      <div className="flex items-center justify-between text-[12px] font-extrabold text-[#0F1730]">
        <Link href="/forgot-password" className="hover:underline">
          Esqueci minha senha
        </Link>
        <a href="#">Precisa de ajuda?</a>
      </div>
    </form>
  );
}

"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type Status = "idle" | "loading" | "success" | "error";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível enviar o e-mail. Tente novamente.");
      }

      setStatus("success");
      setMessage("Se o e-mail informado estiver cadastrado, enviaremos um link para redefinir a senha.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o e-mail. Tente novamente.",
      );
    }
  };

  const isLoading = status === "loading";

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-[13px] font-semibold text-[#334155]" htmlFor="email">
          E-mail cadastrado
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

      {message ? (
        <p
          className={`text-[13px] font-semibold ${status === "success" ? "text-emerald-600" : "text-rose-600"}`}
          role="alert"
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#0F1730] py-3 text-center text-[16px] font-extrabold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isLoading}
      >
        {isLoading ? "Enviando..." : "Enviar instruções"}
      </button>

      <p className="text-center text-[12px] font-semibold text-[#475569]">
        Lembrou a senha? <Link href="/login" className="text-[#0F1730] underline">Voltar para login</Link>
      </p>
    </form>
  );
}

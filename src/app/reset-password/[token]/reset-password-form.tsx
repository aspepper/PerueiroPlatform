"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

const LANDING_URL = process.env.NEXT_PUBLIC_PERUEIROS_LANDING_URL || "https://perueiros.com.br";

type Status = "idle" | "loading" | "success" | "error";

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const passwordMismatch = useMemo(() => {
    return confirmPassword.length > 0 && password !== confirmPassword;
  }, [password, confirmPassword]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (passwordMismatch) {
      setMessage("As senhas não conferem.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Não foi possível redefinir a senha.");
      }

      setStatus("success");
      setMessage("Senha redefinida com sucesso!");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Não foi possível redefinir a senha.");
    }
  };

  const isLoading = status === "loading";
  const showSuccessModal = status === "success";

  return (
    <>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-[13px] font-semibold text-[#334155]" htmlFor="password">
            Nova senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-[12px] border border-[#CBD5E1] bg-white px-4 py-3 text-[14px] text-[#111827] outline-none ring-[#FFD54F]/20 transition focus:border-[#FFD54F] focus:ring-4"
            minLength={8}
            required
          />
          <p className="mt-1 text-[11px] text-[#6B7280]">Use pelo menos 8 caracteres.</p>
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-semibold text-[#334155]" htmlFor="confirmPassword">
            Confirmar nova senha
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-[12px] border border-[#CBD5E1] bg-white px-4 py-3 text-[14px] text-[#111827] outline-none ring-[#FFD54F]/20 transition focus:border-[#FFD54F] focus:ring-4"
            minLength={8}
            required
            aria-invalid={passwordMismatch}
          />
          {passwordMismatch ? (
            <p className="mt-1 text-[12px] font-semibold text-rose-600" role="alert">
              As senhas precisam ser iguais.
            </p>
          ) : null}
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
          {isLoading ? "Salvando..." : "Salvar nova senha"}
        </button>

        <p className="text-center text-[12px] font-semibold text-[#475569]">
          Lembrou a senha? <Link href="/login" className="text-[#0F1730] underline">Voltar para login</Link>
        </p>
      </form>

      {showSuccessModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="max-w-sm rounded-[20px] bg-white p-8 text-center shadow-[0_12px_30px_rgba(15,23,48,0.2)]">
            <h3 className="text-[24px] font-extrabold text-[#0F1730]">Senha atualizada!</h3>
            <p className="mt-3 text-[14px] text-[#475569]">
              Obrigado por manter sua conta segura. Clique em OK para conhecer a nossa landing page.
            </p>
            <button
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center rounded-[14px] bg-[#FFD54F] px-6 py-3 text-[15px] font-extrabold text-[#0F1730] transition hover:brightness-110"
              onClick={() => {
                window.location.href = LANDING_URL;
              }}
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

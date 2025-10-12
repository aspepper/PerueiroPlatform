import Link from "next/link";
import type { ReactNode } from "react";

interface RegistryPageShellProps {
  title: string;
  description: string;
  badgeLabel?: string;
  children?: ReactNode;
}

export default function RegistryPageShell({
  title,
  description,
  badgeLabel = "Cadastro",
  children,
}: RegistryPageShellProps) {
  return (
    <main className="min-h-screen w-full bg-[#F5F7FB] text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#CBD5F5] bg-[#EEF2FF] px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#4338CA]">
                {badgeLabel}
              </span>
              <div className="space-y-3">
                <h1 className="text-3xl font-extrabold text-[#0F1730] sm:text-[2.1rem]">{title}</h1>
                <p className="max-w-2xl text-[0.95rem] leading-relaxed text-[#4B5563]">{description}</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-[#4338CA] px-4 py-2 text-sm font-semibold text-[#4338CA] transition hover:bg-[#4338CA] hover:text-white"
            >
              Voltar para o Dashboard
            </Link>
          </div>

          <div className="mt-8 rounded-[20px] border border-dashed border-[#CBD5F5] bg-[#F9FAFB] p-6 text-[0.95rem] text-[#4B5563]">
            {children ?? (
              <p>
                Este módulo ainda está em fase de planejamento. Use esta área para acompanhar o progresso do desenvolvimento e listar os
                requisitos principais do cadastro.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

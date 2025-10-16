import Link from "next/link";

import LogoPerueiro from "@/components/logo-perueiro";
import LoginForm from "./login-form";
export const metadata = { title: "Login • Perueiro Admin" };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="min-h-screen w-full bg-[#F5F7FB] text-slate-900 relative overflow-hidden">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#FFD54F]" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-[420px] w-[420px] rounded-full bg-[#00D2D3] opacity-90" />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-2">
        <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-10 shadow-[0_8px_24px_rgba(11,16,32,0.12)]">
          <div className="flex items-start gap-8">
            <LogoPerueiro className="h-28 w-28 shrink-0" />
            <div>
              <p className="mb-1 text-[16px] font-extrabold text-[#0F1730]">Perueiro Admin</p>
              <h1 className="mb-2 text-[44px] font-extrabold leading-tight text-[#0F1730]">Faça as coisas com carinho.</h1>
              <p className="mb-6 text-[16px] leading-relaxed text-[#6B7280]">
                Cuidar da logística escolar é um ato de atenção. Administre rotas, motoristas e alunos com a mesma dedicação que eles recebem diariamente.
              </p>
              <ul className="space-y-4">
                {[
                  "Cadastro de motoristas, alunos e escolas",
                  "Gestão de pagamentos e recorrências",
                  "Monitoramento de rotas e alertas em tempo real",
                ].map(t => (
                  <li key={t} className="flex items-center gap-3 text-[16px] text-[#1F2937]">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0F1730]">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="#FFD54F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-8 shadow-[0_8px_24px_rgba(11,16,32,0.12)]">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-[32px] font-extrabold text-[#0F1730]">Bem-vindo de volta</h2>
              <p className="text-[16px] text-[#6B7280]">Acesso reservado aos administradores.</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#0F1730] transition hover:text-[#0B1120] hover:underline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar para o site
            </Link>
          </div>
          <LoginForm />
        </section>
      </div>

      <p className="pb-8 text-center text-[12px] text-[#64748B]">© {new Date().getFullYear()} Perueiro. Todos os direitos reservados.</p>
    </main>
  );
}

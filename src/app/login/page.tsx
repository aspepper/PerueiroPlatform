import LogoPerueiro from "@/components/logo-perueiro";
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
          <h2 className="mb-1 text-[32px] font-extrabold text-[#0F1730]">Bem-vindo de volta</h2>
          <p className="mb-6 text-[16px] text-[#6B7280]">Acesso reservado aos administradores.</p>

          <form className="space-y-5">
            <div>
              <label className="mb-2 block text-[13px] font-semibold text-[#334155]">E-mail</label>
              <input type="email" placeholder="voce@perueiro.com"
                     className="w-full rounded-[12px] border border-[#CBD5E1] bg-white px-4 py-3 text-[14px] text-[#111827] outline-none ring-[#00D2D3]/20 transition focus:border-[#00D2D3] focus:ring-4" />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-semibold text-[#334155]">Senha</label>
              <input type="password" placeholder="••••••••"
                     className="w-full rounded-[12px] border border-[#CBD5E1] bg-white px-4 py-3 text-[14px] text-[#111827] outline-none ring-[#FFD54F]/20 transition focus:border-[#FFD54F] focus:ring-4" />
            </div>
            <button type="submit" className="w-full rounded-[14px] bg-[#0F1730] py-3 text-center text-[16px] font-extrabold text-white shadow-sm transition hover:brightness-110">
              Entrar →
            </button>
            <hr className="my-2 border-[#E2E8F0]" />
            <div className="flex items-center justify-between text-[12px] font-extrabold text-[#0F1730]">
              <a href="#">Esqueci minha senha</a>
              <a href="#">Precisa de ajuda?</a>
            </div>
          </form>
        </section>
      </div>

      <p className="pb-8 text-center text-[12px] text-[#64748B]">© {new Date().getFullYear()} Perueiro. Todos os direitos reservados.</p>
    </main>
  );
}

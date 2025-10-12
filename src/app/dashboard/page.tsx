import Link from "next/link";
import LogoutButton from "@/components/logout-button";

const cadastroLinks = [
  { label: "Motoristas", href: "/drivers" },
  { label: "Vans", href: "/vans" },
  { label: "Escolas", href: "/schools" },
  { label: "Clientes", href: "/clients" },
  { label: "Alunos", href: "/students" },
  { label: "Controle de Boletos", href: "/payments" },
  { label: "Lista Negra", href: "/blacklist" },
];

export const metadata = { title: "Dashboard • Perueiro Admin" };
export const dynamic = "force-dynamic";

function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-[16px] border border-[#E5E7EB] bg-white p-5 ${className}`}>{children}</div>;
}

export default function Page() {
  return (
    <main className="min-h-screen w-full bg-[#F5F7FB] text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Card className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-1 text-[12px] font-semibold tracking-[0.15em] text-[#6B7280]">
                PAINEL ADMINISTRATIVO • domingo, 12 de outubro
              </p>
              <h1 className="text-[28px] font-extrabold text-[#0F1730]">Bem-vindo ao centro de controle Perueiro</h1>
              <p className="mt-1 text-[14px] text-[#6B7280]">
                Visualize indicadores prioritários, antecipe decisões operacionais e mantenha a saúde da operação em equilíbrio.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="h-10 rounded-[12px] bg-[#0F1730] px-4 text-[14px] font-semibold text-white hover:brightness-110">
                Sincronizar agora
              </button>
              <LogoutButton variant="solid" />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[#6B7280]">Cadastros</p>
            <div className="flex flex-wrap items-center gap-2">
              {cadastroLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 rounded-[999px] border border-[#CBD5F5] bg-[#EEF2FF] px-4 py-2 text-[13px] font-semibold text-[#1E3A8A] transition hover:border-[#A5B4FC] hover:bg-[#E0E7FF]"
                >
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#60A5FA]" aria-hidden />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="grid grid-cols-1 gap-6 lg:col-span-2">
            <Card>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: "MOTORISTAS CADASTRADOS", value: "0", hint: "Profissionais ativos vinculados às rotas." },
                  { label: "ALUNOS TRANSPORTADOS", value: "0", hint: "Estudantes acompanhados diariamente." },
                  { label: "VANS EM OPERAÇÃO", value: "0", hint: "Veículos homologados com monitoramento." },
                  { label: "PAGAMENTOS PENDENTES", value: "0", hint: "Boletos aguardando confirmação." },
                ].map(k => (
                  <div key={k.label}>
                    <p className="mb-2 text-[12px] font-semibold tracking-[0.15em] text-[#6B7280]">{k.label}</p>
                    <p className="text-[36px] font-extrabold text-[#0F1730]">{k.value}</p>
                    <p className="mt-1 text-[13px] text-[#6B7280]">{k.hint}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <p className="mb-2 text-[12px] font-semibold tracking-[0.15em] text-[#6B7280]">COBERTURA URBANA</p>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[20px] font-extrabold text-[#0F1730]">Rotas monitoradas</h2>
                <button className="rounded-[8px] border border-[#E5E7EB] px-3 py-1.5 text-[12px]">Ver todas</button>
              </div>
              <div className="space-y-2">
                {[
                  "Zona Norte • 18 veículos • 92% de ocupação média",
                  "Zona Leste • 21 veículos • 88% de ocupação média",
                  "Zona Sul • 14 veículos • 76% de ocupação média",
                ].map(item => (
                  <div key={item} className="rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[14px]">
                    {item}
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <p className="mb-2 text-[12px] font-semibold tracking-[0.15em] text-[#6B7280]">HOMOLOGAÇÃO</p>
              <h2 className="mb-3 text-[20px] font-extrabold text-[#0F1730]">Motoristas aguardando aprovação</h2>
              <div className="space-y-2">
                {[
                  "João Mendes • Zona Norte • Documentos: CNH, Antecedentes • 2h",
                  "Camila Nunes • Zona Leste • Documentos: Vistoria, Seguro • 5h",
                ].map(item => (
                  <div key={item} className="rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[14px]">
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card>
              <p className="mb-2 text-[12px] font-semibold tracking-[0.15em] text-[#6B7280]">SAÚDE FINANCEIRA</p>
              <h2 className="text-[20px] font-extrabold text-[#0F1730]">Resumo financeiro</h2>
              <p className="mt-1 text-[13px] text-[#6B7280]">Situação atual do fluxo de recebimentos da plataforma</p>
              <p className="mt-4 text-[12px] font-semibold tracking-[0.15em] text-[#6B7280]">RECEITA PROJETADA</p>
              <p className="text-[36px] font-extrabold text-[#0F1730]">R$ 48.230,50</p>
              <div className="mt-3 space-y-1 text-[13px]">
                <div className="flex justify-between"><span className="text-[#6B7280]">Inadimplência atual</span><span className="text-[#111827]">R$ 9.120,75</span></div>
                <div className="flex justify-between"><span className="text-[#6B7280]">Próxima rodada de cobranças</span><span className="text-[#111827]">15/10/2025</span></div>
                <div className="flex justify-between"><span className="text-[#6B7280]">Índice de arrecadação</span><span className="text-[#111827]">92% (meta 95%)</span></div>
              </div>
            </Card>

            <Card>
              <p className="mb-2 text-[12px] font-semibold tracking-[0.15em] text-[#6B7280]">CENTRAL DE ALERTAS</p>
              <h2 className="mb-3 text-[20px] font-extrabold text-[#0F1730]">Ocorrências recentes</h2>
              {[
                "Atraso • Zona Norte • PROTOCOLO INC-3412 • Resolvido • 08:15",
                "Falta • Zona Oeste • PROTOCOLO INC-3409 • Em acompanhamento • Ontem",
                "Manutenção • Zona Leste • PROTOCOLO INC-3404 • Aguardando peça • Há 3 dias",
              ].map(t => (
                <div key={t} className="mb-2 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[14px]">
                  {t}
                </div>
              ))}
            </Card>

            <Card>
              <p className="mb-2 text-[12px] font-semibold tracking-[0.15em] text-[#6B7280]">PRÓXIMOS PASSOS</p>
              <ul className="list-disc pl-5 text-[14px]">
                <li>Reforçar cobrança de parcelas atrasadas</li>
                <li>Enviar relatório consolidado às diretorias</li>
                <li>Agendar conferência com financeiro da rede</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

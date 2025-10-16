import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import LogoutButton from "@/components/logout-button";

const cadastrosLinks = [
  { label: "Motoristas", href: "/drivers" },
  { label: "Vans", href: "/vans" },
  { label: "Escolas", href: "/schools" },
  { label: "Clientes", href: "/clients" },
  { label: "Alunos", href: "/students" },
  { label: "Controle de Pagamentos", href: "/payments" },
  { label: "Lista Negra", href: "/blacklist" },
];

const highlights = [
  {
    label: "Solicitações abertas",
    value: "18",
    caption: "Monitoramento em tempo real",
  },
  {
    label: "Alertas críticos",
    value: "2",
    caption: "Prioridade imediata",
  },
  {
    label: "Atualizações hoje",
    value: "12",
    caption: "Integrações sincronizadas",
  },
];

const statusDetails = [
  {
    label: "Última sincronização",
    value: "há 12 minutos",
  },
  {
    label: "Próxima janela",
    value: "23h00",
  },
  {
    label: "Integrações monitoradas",
    value: "12 de 12 ativas",
  },
];

function formatDate() {
  const today = format(new Date(), "eee, d 'de' MMMM", { locale: ptBR });
  return today.charAt(0).toUpperCase() + today.slice(1);
}

export default function DashboardHeader() {
  const today = formatDate();

  return (
    <header className="relative overflow-hidden rounded-[2.75rem] bg-slate-900 text-white shadow-2xl shadow-slate-900/30 ring-1 ring-white/10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.25),transparent_65%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
        aria-hidden
      />

      <div className="relative flex flex-col gap-12 p-8 sm:p-10 lg:p-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-cyan-100/80">
              Centro de Controle • Perueiros
            </p>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-[2.6rem]">
                Operações em sincronia com o dia a dia
              </h1>
              <p className="max-w-xl text-sm text-slate-200/85">
                Acompanhe solicitações, supervisione rotas monitoradas e mantenha o controle financeiro da plataforma em uma visão centralizada.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-5 sm:flex-row sm:items-center sm:justify-end lg:w-auto lg:flex-col lg:items-end">
            <div className="flex flex-col items-start gap-3 text-left text-xs font-semibold uppercase tracking-[0.28em] text-slate-200 sm:flex-row sm:items-center sm:gap-4 lg:flex-col lg:items-end">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[0.72rem] text-slate-100">
                {today}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-4 py-1 text-[0.72rem] font-semibold text-emerald-100">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300" aria-hidden />
                Operação estável
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
              <LogoutButton />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((highlight) => (
            <article
              key={highlight.label}
              className="rounded-3xl border border-white/10 bg-white/10 px-6 py-5 text-left shadow-[0_18px_70px_-40px_rgba(15,23,42,0.8)] backdrop-blur"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-100/80">{highlight.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{highlight.value}</p>
              <p className="mt-2 text-xs text-slate-100/75">{highlight.caption}</p>
            </article>
          ))}
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <dl className="grid gap-3 text-xs text-slate-200/90 sm:grid-cols-3 sm:gap-4">
            {statusDetails.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <dt className="font-semibold uppercase tracking-[0.24em] text-slate-200/80">{item.label}</dt>
                <dd className="mt-2 text-sm font-semibold text-white">{item.value}</dd>
              </div>
            ))}
          </dl>

          <nav className="w-full rounded-3xl border border-white/10 bg-white/10 px-5 py-4 text-slate-100 backdrop-blur lg:w-auto">
            <div className="flex flex-col gap-3 text-sm lg:flex-row lg:items-center lg:gap-4">
              <span className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-200/70">Cadastros</span>
              <div className="flex flex-wrap items-center gap-2">
                {cadastrosLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
                  >
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-cyan-200" aria-hidden />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

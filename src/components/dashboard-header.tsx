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
  { label: "Controle de Boletos", href: "/payments" },
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
    <header className="relative overflow-hidden rounded-[2.75rem] border border-slate-200/60 bg-white/95 p-10 text-slate-900 shadow-[0_30px_90px_-48px_rgba(15,23,42,0.35)] backdrop-blur">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 border border-white/70 opacity-20" aria-hidden="true" />

      <div className="relative space-y-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-primary-600">
              Centro de Controle • Perueiros
            </p>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-[2.5rem]">
                Operação estável e conectada em tempo real
              </h1>
              <p className="max-w-xl text-sm text-slate-600">
                Acompanhe solicitações, supervisione rotas monitoradas e controle o ciclo financeiro da plataforma em uma visão
                centralizada.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-start sm:justify-between lg:w-auto lg:flex-col lg:items-end">
            <div className="flex flex-col items-start gap-2 text-left text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 sm:flex-row sm:items-center sm:gap-3 lg:flex-col lg:items-end">
              <span className="rounded-full border border-slate-200/80 bg-white/80 px-4 py-1 text-[0.7rem] text-slate-600">
                {today}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1 text-[0.7rem] font-semibold text-emerald-600">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                Operação estável
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_-30px_rgba(15,23,42,0.4)] transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20" aria-hidden>
                  ↻
                </span>
                Sincronizar agora
              </button>
              <LogoutButton />
            </div>
          </div>
        </div>

        <nav className="rounded-[2rem] border border-slate-200/70 bg-slate-50/80 p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.28)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">Cadastros</span>
            <div className="flex flex-wrap items-center gap-2">
              {cadastrosLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="inline-flex items-center gap-2 rounded-full border border-transparent bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary-200 hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                >
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary-500" aria-hidden />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {highlights.map((highlight) => (
              <article
                key={highlight.label}
                className="group relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_26px_70px_-48px_rgba(15,23,42,0.28)] transition duration-300 ease-out hover:-translate-y-1 hover:border-primary-200/60 hover:shadow-[0_32px_80px_-45px_rgba(15,23,42,0.32)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 via-white/70 to-white/90 opacity-0 transition duration-500 group-hover:opacity-100" aria-hidden />
                <div className="relative space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">{highlight.label}</p>
                  <p className="text-3xl font-semibold tracking-tight text-slate-900">{highlight.value}</p>
                  <p className="text-xs text-slate-500">{highlight.caption}</p>
                </div>
              </article>
            ))}
          </div>

          <section className="w-full max-w-md overflow-hidden rounded-[2.25rem] border border-slate-200/70 bg-white/90 p-6 text-sm text-slate-600 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.3)] xl:w-[360px]">
            <header className="space-y-1 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary-600">Status da plataforma</p>
              <h2 className="text-xl font-semibold text-slate-900">Sincronização ativa</h2>
              <p>Monitoramento contínuo dos sistemas conectados ao centro de controle.</p>
            </header>
            <dl className="mt-6 space-y-4">
              {statusDetails.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 text-xs text-slate-500">
                  <dt className="font-semibold uppercase tracking-[0.2em] text-slate-400">{item.label}</dt>
                  <dd className="rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-[0.7rem] font-semibold text-slate-600">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-xs text-slate-500">
              Alertas serão enviados automaticamente caso qualquer integração apresente instabilidade durante o período operacional.
            </p>
          </section>
        </div>
      </div>
    </header>
  );
}

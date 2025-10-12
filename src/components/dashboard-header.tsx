import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardHeader() {
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <header className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white/80 px-8 py-12 text-slate-900 shadow-[0_28px_90px_-48px_rgba(15,23,42,0.4)] backdrop-blur">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_55%)]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 border border-white/60 opacity-30" aria-hidden="true" />

      <div className="relative flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-primary-700">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary-400" aria-hidden="true" />
              Painel administrativo
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 text-[0.7rem] font-medium tracking-[0.24em] text-slate-600">
              {today}
            </span>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-[2.5rem]">
              Bem-vindo ao centro de controle Perueiros
            </h1>
            <p className="max-w-xl text-base text-slate-600">
              Visualize indicadores prioritários, antecipe decisões operacionais e mantenha a saúde da operação em equilíbrio com informação em tempo real.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Solicitações abertas",
                value: "18",
                caption: "Últimas 24h",
              },
              {
                label: "Alertas críticos",
                value: "2",
                caption: "Monitoramento",
              },
              {
                label: "Atualizações hoje",
                value: "12",
                caption: "Integrações",
              },
            ].map((highlight) => (
              <div
                key={highlight.label}
                className="rounded-3xl border border-slate-200/70 bg-white/70 px-6 py-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.4)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-primary-200/60 hover:shadow-[0_28px_65px_-35px_rgba(15,23,42,0.35)]"
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-slate-500">
                  {highlight.label}
                </p>
                <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">{highlight.value}</p>
                <p className="text-xs font-medium text-slate-500">{highlight.caption}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-sm space-y-6">
          <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/75 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
            <div className="pointer-events-none absolute -right-20 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-primary-200/35 blur-3xl" aria-hidden="true" />
            <div className="relative space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">Ações rápidas</p>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-emerald-600">
                  Operação estável
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="group relative flex items-center justify-center gap-2 rounded-2xl border border-transparent bg-primary-500 px-5 py-3 text-sm font-semibold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 hover:bg-primary-600"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white" aria-hidden="true">
                    ↻
                  </span>
                  Sincronizar
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500" aria-hidden="true">
                    ⤓
                  </span>
                  Exportar
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Última sincronização concluída há 12 minutos. Sistemas e integrações monitorados em tempo real.
              </p>
            </div>
          </section>

          <section className="grid gap-4 rounded-[1.75rem] border border-slate-200/70 bg-white/70 p-6 text-xs text-slate-600 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.32)]">
            <div className="flex items-center justify-between">
              <span className="font-medium uppercase tracking-[0.24em] text-slate-500">Sincronização</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[0.7rem] font-semibold text-emerald-600">Automática ativa</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium uppercase tracking-[0.24em] text-slate-500">Exportação</span>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-[0.7rem] font-semibold text-primary-600">Relatório mensal pronto</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium uppercase tracking-[0.24em] text-slate-500">Próximo ciclo</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[0.7rem] font-semibold text-slate-600">Agendado para 23h</span>
            </div>
          </section>
        </div>
      </div>
    </header>
  );
}

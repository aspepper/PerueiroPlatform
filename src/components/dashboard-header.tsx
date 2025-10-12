import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardHeader() {
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <header className="relative overflow-hidden rounded-[2.8rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-8 py-12 text-white shadow-[0_50px_120px_-40px_rgba(2,6,23,0.8)]">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary-500/25 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full bg-primary-400/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute inset-10 rounded-[2rem] border border-white/10 opacity-30" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 translate-y-1/3 rounded-full bg-primary-200/10 blur-[140px]" aria-hidden />

      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)] lg:items-start">
        <div className="max-w-3xl space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-primary-100/90 shadow-sm shadow-primary-500/20">
              Painel administrativo
            </p>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-primary-100/80">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" aria-hidden />
              Operação estável
            </span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white lg:text-[3rem]">
              Bem-vindo ao centro de controle Perueiros
            </h1>
            <p className="text-sm font-medium text-slate-200/80">{today}</p>
            <p className="max-w-xl text-base text-slate-200/80">
              Visualize indicadores críticos, acompanhe aprovações pendentes e direcione ações prioritárias para manter o fluxo operacional em ritmo seguro.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Solicitações abertas",
                value: "18",
                caption: "Últimas 24h",
                accent: "from-sky-400/30 via-sky-300/10 to-transparent text-sky-100",
              },
              {
                label: "Alertas críticos",
                value: "2",
                caption: "Monitoramento",
                accent: "from-rose-400/40 via-rose-300/10 to-transparent text-rose-100",
              },
              {
                label: "Atualizações hoje",
                value: "12",
                caption: "Integrações",
                accent: "from-emerald-400/40 via-emerald-300/10 to-transparent text-emerald-100",
              },
            ].map((highlight) => (
              <div
                key={highlight.label}
                className="group relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 px-6 py-5 shadow-[0_30px_60px_-35px_rgba(15,23,42,0.85)] backdrop-blur transition hover:-translate-y-1 hover:border-white/30"
              >
                <div
                  className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${highlight.accent} blur-3xl transition-all duration-300 group-hover:-right-6 group-hover:-top-6`}
                  aria-hidden
                />
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-primary-100/80">
                  {highlight.label}
                </p>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{highlight.value}</p>
                <p className="text-xs font-medium text-primary-100/70">{highlight.caption}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-6">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-6 shadow-[0_40px_90px_-45px_rgba(15,23,42,0.8)] backdrop-blur-xl">
            <div className="pointer-events-none absolute -top-32 right-10 h-64 w-64 rounded-full bg-primary-400/30 blur-3xl" aria-hidden />
            <div className="relative space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white/90">Ações rápidas</p>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-white/70">
                  Sessão segura
                </span>
              </div>
              <div className="relative rounded-3xl border border-white/10 bg-white/10 p-4 shadow-inner shadow-white/10">
                <div className="absolute inset-y-6 left-1/2 hidden w-px -translate-x-1/2 bg-white/20 sm:block" aria-hidden />
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className="group relative flex items-center justify-center gap-3 rounded-[1.8rem] px-6 py-3 text-sm font-semibold text-slate-950 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    aria-pressed="true"
                  >
                    <span className="absolute inset-0 rounded-[1.8rem] bg-white/95 shadow-lg shadow-primary-500/30 transition group-hover:shadow-primary-300/40" aria-hidden />
                    <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                      ↻
                    </span>
                    <span className="relative">Sincronizar agora</span>
                  </button>
                  <button
                    type="button"
                    className="relative flex items-center justify-center gap-3 rounded-[1.8rem] border border-white/30 px-6 py-3 text-sm font-semibold text-white/85 transition hover:border-white/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    aria-pressed="false"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white/80">
                      ⤓
                    </span>
                    Exportar relatório
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-200/80">
                Última sincronização concluída há 12 minutos. Todos os sistemas operacionais permanecem estáveis e monitorados.
              </p>
            </div>
          </div>

          <div className="grid gap-4 rounded-[2.2rem] border border-white/10 bg-white/5 p-6 text-xs text-white/80 shadow-[0_40px_90px_-45px_rgba(15,23,42,0.75)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="font-medium uppercase tracking-[0.24em] text-white/60">Sincronização</span>
              <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-[0.7rem] font-semibold text-emerald-100">Automática ativa</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium uppercase tracking-[0.24em] text-white/60">Exportação</span>
              <span className="rounded-full bg-primary-400/20 px-3 py-1 text-[0.7rem] font-semibold text-primary-100">Relatório mensal pronto</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium uppercase tracking-[0.24em] text-white/60">Próximo ciclo</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[0.7rem] font-semibold text-white/80">Agendado para 23h</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

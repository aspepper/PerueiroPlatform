import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardHeader() {
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <header className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 px-8 py-12 text-white shadow-2xl shadow-slate-900/40">
      <div
        className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-primary-500/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-primary-300/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-36 right-1/2 h-96 w-96 translate-x-1/2 rounded-full bg-white/5 blur-[160px]"
        aria-hidden
      />

      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
        <div className="max-w-2xl space-y-6">
          <p className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary-100/80 shadow-sm shadow-primary-500/20">
            Painel administrativo
          </p>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white lg:text-[2.75rem]">
              Bem-vindo ao Perueiros Admin
            </h1>
            <p className="text-sm font-medium text-slate-200/80">{today}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Solicitações abertas", value: "18", caption: "Últimas 24h" },
              { label: "Alertas críticos", value: "2", caption: "Monitoramento" },
              { label: "Atualizações hoje", value: "12", caption: "Integrações" },
            ].map((highlight) => (
              <div
                key={highlight.label}
                className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur transition hover:border-primary-200/50 hover:bg-white/10"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-16 w-16 rounded-full bg-primary-400/30 blur-xl transition group-hover:translate-x-2" aria-hidden />
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-primary-100/80">
                  {highlight.label}
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{highlight.value}</p>
                <p className="text-xs font-medium text-primary-100/70">{highlight.caption}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-5 rounded-4xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/30 backdrop-blur-xl">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-100">Ações rápidas</p>
            <div className="relative">
              <div className="absolute inset-x-6 top-1/2 hidden h-px -translate-y-1/2 bg-white/20 sm:block" aria-hidden />
              <div className="absolute left-6 top-1/2 hidden h-3 w-3 -translate-y-1/2 rounded-full bg-white sm:block" aria-hidden />
              <div className="absolute right-6 top-1/2 hidden h-3 w-3 -translate-y-1/2 rounded-full border border-white/60 sm:block" aria-hidden />
              <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  className="group relative flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-slate-900 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:py-2.5"
                  aria-pressed="true"
                >
                  <span className="absolute inset-0 rounded-full bg-white shadow-lg shadow-primary-500/30 transition group-hover:shadow-primary-400/40" aria-hidden />
                  <span className="relative">Sincronizar agora</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:py-2.5"
                  aria-pressed="false"
                >
                  Exportar relatório
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-200/80">
              Última sincronização concluída há 12 minutos. Todos os sistemas operacionais estão estáveis.
            </p>
          </div>
          <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
            <div className="flex items-center justify-between">
              <span className="font-medium uppercase tracking-[0.24em] text-white/60">Sincronização</span>
              <span className="text-white/90">Automática ativa</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium uppercase tracking-[0.24em] text-white/60">Exportação</span>
              <span className="text-white/90">Relatório mensal pronto</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

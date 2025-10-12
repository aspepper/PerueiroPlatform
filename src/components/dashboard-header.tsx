import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const quickHighlights = [
  { label: "Solicitações abertas", value: "18" },
  { label: "Alertas críticos", value: "2" },
  { label: "Atualizações hoje", value: "12" },
];

export default function DashboardHeader() {
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <header className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-xl shadow-slate-900/20">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary-400/40 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-primary-600/30 blur-3xl" aria-hidden />
      <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary-200/80">
            Painel administrativo
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white">
            Bem-vindo ao Perueiros Admin
          </h1>
          <p className="text-sm font-medium text-slate-300">{today}</p>
          <div className="grid grid-cols-1 gap-3 text-sm text-slate-200 sm:grid-cols-3">
            {quickHighlights.map((highlight) => (
              <div key={highlight.label} className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-slate-300">{highlight.label}</p>
                <p className="mt-1 text-lg font-semibold text-white">{highlight.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-lg lg:w-auto">
          <p className="text-sm font-medium text-slate-100">Ações rápidas</p>
          <div className="flex flex-wrap gap-3">
            <button className="flex-1 rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:flex-none">
              Sincronizar agora
            </button>
            <button className="flex-1 rounded-full border border-white/40 px-6 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:flex-none">
              Exportar relatório
            </button>
          </div>
          <p className="text-xs text-slate-200">
            Última sincronização concluída há 12 minutos. Todos os sistemas operacionais estão estáveis.
          </p>
        </div>
      </div>
    </header>
  );
}

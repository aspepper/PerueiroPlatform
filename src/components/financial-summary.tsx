const summary = {
  revenue: 48230.5,
  overdue: 9120.75,
  nextBilling: "15/10/2025",
  collectionRate: 92,
};

const highlights = [
  {
    title: "Pagamentos liquidados",
    value: "R$ 73.420,00",
    description: "Total recebido nos últimos 30 dias",
  },
  {
    title: "Repasses às escolas",
    value: "R$ 28.540,00",
    description: "Conciliação confirmada na semana",
  },
];

const reminders = [
  "Reforçar cobrança de parcelas atrasadas",
  "Enviar relatório consolidado às diretorias",
  "Agendar conferência com financeiro da rede",
];

export default function FinancialSummary() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-sm shadow-slate-900/5">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Saúde financeira</p>
        <h2 className="text-2xl font-semibold text-slate-900">Resumo financeiro</h2>
        <p className="text-sm text-slate-500">Situação atualizada do fluxo de recebimentos da plataforma</p>
      </header>

      <div className="mt-6 space-y-6">
        <div className="rounded-3xl bg-slate-900 px-6 py-6 text-white shadow-inner shadow-black/30">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/70">Receita projetada</p>
          <p className="mt-3 text-[2.15rem] font-semibold">
            {summary.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <dl className="mt-4 grid gap-3 text-sm text-white/80">
            <div className="flex items-center justify-between gap-4">
              <dt>Inadimplência atual</dt>
              <dd className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white">
                {summary.overdue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Próxima rodada de cobranças</dt>
              <dd className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white/90">{summary.nextBilling}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Índice de arrecadação</dt>
              <dd className="flex items-center gap-2 font-semibold text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm">
                  {summary.collectionRate}%
                </span>
                Meta mensal
              </dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-3">
          {highlights.map((highlight) => (
            <div key={highlight.title} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-inner shadow-white/40">
              <p className="text-sm font-semibold text-slate-900">{highlight.title}</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{highlight.value}</p>
              <p className="text-xs text-slate-500">{highlight.description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-inner shadow-slate-900/5">
          <p className="text-sm font-semibold text-slate-900">Próximos passos</p>
          <ul className="mt-4 space-y-3 text-xs text-slate-500">
            {reminders.map((reminder) => (
              <li key={reminder} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-500" aria-hidden />
                <span>{reminder}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

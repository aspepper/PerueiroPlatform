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
    <section className="rounded-3xl border border-white/80 bg-white/80 p-6 shadow-lg shadow-slate-900/5">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">Resumo financeiro</h2>
        <p className="text-sm text-slate-500">Situação atualizada do fluxo de recebimentos da plataforma</p>
      </header>
      <div className="mt-6 space-y-5">
        <div className="rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-6 text-white shadow-inner">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-100/80">Receita projetada</p>
          <p className="mt-3 text-3xl font-semibold">
            {summary.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <dl className="mt-6 grid gap-4 text-sm text-primary-50/80">
            <div className="flex items-center justify-between">
              <dt>Inadimplência atual</dt>
              <dd className="font-semibold">
                {summary.overdue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Próxima rodada de cobranças</dt>
              <dd className="font-semibold">{summary.nextBilling}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Índice de arrecadação</dt>
              <dd className="font-semibold">{summary.collectionRate}%</dd>
            </div>
          </dl>
        </div>
        <div className="grid gap-4">
          {highlights.map((highlight) => (
            <div key={highlight.title} className="rounded-2xl border border-slate-100/70 bg-slate-50/70 p-4">
              <p className="text-sm font-semibold text-slate-900">{highlight.title}</p>
              <p className="text-xl font-semibold text-slate-900">{highlight.value}</p>
              <p className="text-xs text-slate-500">{highlight.description}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-slate-100/70 bg-slate-50/70 p-4">
          <p className="text-sm font-semibold text-slate-900">Próximos passos</p>
          <ul className="mt-3 space-y-2 text-xs text-slate-500">
            {reminders.map((reminder) => (
              <li key={reminder} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500" aria-hidden />
                <span>{reminder}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const summary = {
  revenue: 48230.5,
  overdue: 9120.75,
  nextBilling: "15/10/2025",
  collectionRate: 92
};

const highlights = [
  {
    title: "Pagamentos liquidados",
    value: "R$ 73.420,00",
    description: "Total recebido nos últimos 30 dias"
  },
  {
    title: "Repasses às escolas",
    value: "R$ 28.540,00",
    description: "Conciliação confirmada na semana"
  }
];

export default function FinancialSummary() {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <header>
        <h2 className="text-lg font-semibold text-slate-900">Resumo financeiro</h2>
        <p className="text-sm text-slate-500">Dados consolidados da plataforma web</p>
      </header>
      <div className="mt-5 space-y-5">
        <div className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 p-5 text-white">
          <p className="text-xs uppercase tracking-wider text-primary-50/90">Receita projetada</p>
          <p className="mt-2 text-2xl font-semibold">{summary.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-primary-50/90">
            <span>
              Inadimplência atual: {summary.overdue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
            <span>Próxima rodada de cobranças: {summary.nextBilling}</span>
            <span>Índice de arrecadação: {summary.collectionRate}%</span>
          </div>
        </div>
        <div className="space-y-4">
          {highlights.map((highlight) => (
            <div key={highlight.title} className="rounded-xl border border-slate-100 p-4">
              <p className="text-sm font-semibold text-slate-800">{highlight.title}</p>
              <p className="text-lg font-bold text-slate-900">{highlight.value}</p>
              <p className="text-xs text-slate-400">{highlight.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

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
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.32)]">
      <div className="pointer-events-none absolute -right-24 top-1/4 h-56 w-56 rounded-full bg-primary-200/25 blur-3xl" aria-hidden="true" />
      <header className="relative space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600/80">Saúde financeira</p>
        <h2 className="text-2xl font-semibold text-slate-900">Resumo financeiro</h2>
        <p className="text-sm text-slate-500">Situação atualizada do fluxo de recebimentos da plataforma</p>
      </header>
      <div className="relative mt-7 space-y-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
          <div className="pointer-events-none absolute -left-24 top-0 h-56 w-56 rounded-full bg-white/15 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-100/80">Receita projetada</p>
              <p className="mt-3 text-[2.25rem] font-semibold">
                {summary.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
            <dl className="grid gap-4 text-sm text-primary-50/80">
              <div className="flex items-center justify-between">
                <dt>Inadimplência atual</dt>
                <dd className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white">
                  {summary.overdue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Próxima rodada de cobranças</dt>
                <dd className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white/90">{summary.nextBilling}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Índice de arrecadação</dt>
                <dd className="flex items-center gap-2 font-semibold text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 text-sm">
                    {summary.collectionRate}%
                  </span>
                  Meta mensal
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="grid gap-4">
          {highlights.map((highlight) => (
            <div
              key={highlight.title}
              className="relative overflow-hidden rounded-[1.6rem] border border-slate-200/70 bg-white/80 p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.28)]"
            >
              <div className="pointer-events-none absolute -right-16 top-1/2 h-24 w-24 -translate-y-1/2 bg-gradient-to-br from-primary-200/20 via-primary-100/10 to-transparent blur-2xl" aria-hidden="true" />
              <div className="relative space-y-2">
                <p className="text-sm font-semibold text-slate-900">{highlight.title}</p>
                <p className="text-2xl font-semibold text-slate-900">{highlight.value}</p>
                <p className="text-xs text-slate-500">{highlight.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-[1.6rem] border border-slate-200/70 bg-white/80 p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.28)]">
          <p className="text-sm font-semibold text-slate-900">Próximos passos</p>
          <ul className="mt-4 space-y-3 text-xs text-slate-500">
            {reminders.map((reminder) => (
              <li key={reminder} className="flex items-start gap-3">
                <span className="mt-1 flex h-2 w-2 items-center justify-center rounded-full bg-primary-500" aria-hidden="true" />
                <span>{reminder}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

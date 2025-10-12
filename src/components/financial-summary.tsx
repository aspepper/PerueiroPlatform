const summary = {
  revenue: 48230.5,
  overdue: 9120.75,
  nextBilling: "15/10/2025",
  collectionRate: 92,
  collectionGoal: 95,
};

const details = [
  {
    label: "Inadimplência atual",
    value: summary.overdue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
  },
  {
    label: "Próxima rodada de cobranças",
    value: summary.nextBilling,
  },
  {
    label: "Índice de arrecadação",
    value: `${summary.collectionRate}% (meta ${summary.collectionGoal}%)`,
  },
];

export default function FinancialSummary() {
  return (
    <section className="w-full max-w-3xl rounded-[36px] border border-[#E5E7EB] bg-white px-10 py-12 shadow-[0_60px_120px_-70px_rgba(15,23,42,0.55)] sm:px-14 sm:py-16">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#6E778C]">Saúde financeira</p>
        <h2 className="text-4xl font-semibold italic text-[#101B3A] sm:text-[2.65rem]">Resumo financeiro</h2>
        <p className="max-w-xl text-base leading-relaxed text-[#6B7280]">
          Situação atual do fluxo de recebimentos da plataforma
        </p>
      </header>

      <div className="mt-12 space-y-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#6E778C]">Receita projetada</p>
          <p className="mt-3 text-[2.75rem] font-semibold text-[#101B3A] sm:text-[3.25rem]">
            {summary.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </div>

        <dl className="space-y-5 text-base text-[#6B7280]">
          {details.map((detail) => (
            <div key={detail.label} className="flex items-center justify-between gap-6">
              <dt className="font-medium">{detail.label}</dt>
              <dd className="text-right font-semibold text-[#101B3A]">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

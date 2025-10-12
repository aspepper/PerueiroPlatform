const metrics = [
  {
    label: "Motoristas ativos",
    value: 128,
    variation: "+12%",
    status: "up",
    description: "Motoristas sincronizados com o aplicativo nas últimas 24h"
  },
  {
    label: "Alunos transportados",
    value: 1420,
    variation: "+4%",
    status: "up",
    description: "Total de alunos vinculados às rotas ativas"
  },
  {
    label: "Pagamentos pendentes",
    value: 37,
    variation: "-9%",
    status: "down",
    description: "Boletos que expiram nos próximos 5 dias"
  }
];

export default function MetricsGrid() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
        >
          <p className="text-sm font-medium text-slate-500">{metric.label}</p>
          <div className="mt-3 flex items-end justify-between">
            <span className="text-3xl font-bold text-slate-900">{metric.value.toLocaleString("pt-BR")}</span>
            <span
              className={`text-sm font-semibold ${
                metric.status === "up" ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {metric.variation}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">{metric.description}</p>
        </article>
      ))}
    </section>
  );
}

export type Metric = {
  label: string;
  value: number;
  variation?: string;
  status?: "up" | "down";
  description: string;
};

const defaultMetrics: Metric[] = [
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

export default function MetricsGrid({ metrics = defaultMetrics }: { metrics?: Metric[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => {
        const variation = metric.variation;
        const status = metric.status ?? "up";

        return (
          <article
            key={metric.label}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
          >
            <p className="text-sm font-medium text-slate-500">{metric.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-900">
                {metric.value.toLocaleString("pt-BR")}
              </span>
              {variation ? (
                <span
                  className={`text-sm font-semibold ${
                    status === "up" ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {variation}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-slate-400">{metric.description}</p>
          </article>
        );
      })}
    </section>
  );
}

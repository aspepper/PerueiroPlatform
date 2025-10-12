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
    description: "Motoristas sincronizados com o aplicativo nas últimas 24h",
  },
  {
    label: "Alunos transportados",
    value: 1420,
    variation: "+4%",
    status: "up",
    description: "Total de alunos vinculados às rotas ativas",
  },
  {
    label: "Pagamentos pendentes",
    value: 37,
    variation: "-9%",
    status: "down",
    description: "Boletos que expiram nos próximos 5 dias",
  },
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
            className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm shadow-slate-900/5 transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-slate-600">{metric.label}</p>
              {variation ? (
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    status === "up"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  <span aria-hidden>{status === "up" ? "▲" : "▼"}</span>
                  {variation}
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              {metric.value.toLocaleString("pt-BR")}
            </p>
            <p className="mt-2 text-xs text-slate-500">{metric.description}</p>
          </article>
        );
      })}
    </section>
  );
}

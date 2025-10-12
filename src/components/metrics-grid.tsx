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
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => {
        const variation = metric.variation;
        const status = metric.status ?? "up";

        return (
          <article
            key={metric.label}
            className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/10 backdrop-blur-xl transition duration-200 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/20"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 opacity-80" aria-hidden />
            <p className="text-sm font-medium text-slate-500">{metric.label}</p>
            <div className="mt-5 flex items-end justify-between gap-4">
              <span className="text-4xl font-semibold tracking-tight text-slate-900">
                {metric.value.toLocaleString("pt-BR")}
              </span>
              {variation ? (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    status === "up"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-600"
                  }`}
                >
                  {variation}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-slate-500">{metric.description}</p>
          </article>
        );
      })}
    </section>
  );
}

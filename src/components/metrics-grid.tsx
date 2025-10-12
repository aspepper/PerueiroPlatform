export type Metric = {
  label: string;
  value: number;
  description: string;
  variation?: string;
  status?: "up" | "down";
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
  {
    label: "Ocorrências resolvidas",
    value: 8,
    variation: "+5",
    status: "up",
    description: "Solicitações respondidas nas últimas 24h",
  },
];

export default function MetricsGrid({ metrics = defaultMetrics }: { metrics?: Metric[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const statusClass =
          metric.status === "up"
            ? "text-emerald-600"
            : metric.status === "down"
              ? "text-rose-600"
              : "text-slate-500";

        return (
          <article
            key={metric.label}
            className="flex h-full flex-col justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
          >
            <div>
              <p className="text-sm font-medium text-slate-500">{metric.label}</p>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">{metric.value.toLocaleString("pt-BR")}</span>
                {metric.variation ? (
                  <span className={`text-sm font-semibold ${statusClass}`}>{metric.variation}</span>
                ) : null}
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">{metric.description}</p>
          </article>
        );
      })}
    </section>
  );
}

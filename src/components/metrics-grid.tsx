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
            className="group relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-[0_26px_70px_-48px_rgba(15,23,42,0.35)] transition duration-300 ease-out hover:-translate-y-1 hover:border-primary-200/60 hover:shadow-[0_32px_80px_-40px_rgba(15,23,42,0.35)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 via-white/60 to-white/80 opacity-0 transition duration-500 group-hover:opacity-100" aria-hidden="true" />
            <div className="absolute -right-16 top-1/3 h-44 w-44 rounded-full bg-primary-200/30 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" aria-hidden="true" />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
                {variation ? (
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${
                      status === "up"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                        : "border-rose-200 bg-rose-50 text-rose-600"
                    }`}
                  >
                    <span aria-hidden>{status === "up" ? "▲" : "▼"}</span>
                    {variation}
                  </span>
                ) : null}
              </div>
              <div className="space-y-2">
                <span className="text-[2.6rem] font-semibold tracking-tight text-slate-900">
                  {metric.value.toLocaleString("pt-BR")}
                </span>
                <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" aria-hidden="true" />
              </div>
              <p className="text-sm text-slate-600">{metric.description}</p>
            </div>
          </article>
        );
      })}
    </section>
  );
}

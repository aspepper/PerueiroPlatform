const routes = [
  {
    name: "Zona Norte",
    vehicles: 18,
    occupancy: 92,
    issues: 1,
    status: "Operação normal",
  },
  {
    name: "Zona Leste",
    vehicles: 21,
    occupancy: 88,
    issues: 2,
    status: "Atenção com atrasos",
  },
  {
    name: "Zona Sul",
    vehicles: 14,
    occupancy: 76,
    issues: 0,
    status: "Operação normal",
  },
];

function getStatusStyles(status: string) {
  if (status.toLowerCase().includes("atenção")) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

export default function RoutesOverview() {
  return (
    <section className="rounded-3xl border border-white/80 bg-white/80 p-6 shadow-lg shadow-slate-900/5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Rotas monitoradas</h2>
          <p className="text-sm text-slate-500">Resumo das linhas operacionais e nível de ocupação dos veículos</p>
        </div>
        <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary-200 hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">
          Ver todas
        </button>
      </header>
      <div className="mt-6 space-y-4">
        {routes.map((route) => (
          <div
            key={route.name}
            className="group rounded-2xl border border-slate-100/70 bg-slate-50/60 p-5 transition hover:border-primary-200 hover:bg-primary-50/50"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-slate-900">{route.name}</p>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {route.vehicles} veículos · {route.occupancy}% de ocupação média
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusStyles(route.status)}`}
              >
                {route.status}
              </span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
                style={{ width: `${route.occupancy}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {route.issues === 0
                ? "Nenhum incidente registrado hoje"
                : `Incidentes registrados hoje: ${route.issues}`}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

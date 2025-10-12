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
    return "bg-amber-50 text-amber-700 border-amber-100";
  }

  return "bg-emerald-50 text-emerald-700 border-emerald-100";
}

export default function RoutesOverview() {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white px-6 py-7 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Cobertura urbana</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Rotas monitoradas</h2>
          <p className="text-sm text-slate-500">Resumo das linhas operacionais e nível de ocupação dos veículos</p>
        </div>
        <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-cyan-200 hover:text-cyan-700">
          Ver todas
        </button>
      </header>

      <div className="mt-6 space-y-4">
        {routes.map((route) => (
          <div
            key={route.name}
            className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-inner shadow-white/60"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">{route.name}</p>
                <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-slate-400">
                  {route.vehicles} veículos · {route.occupancy}% de ocupação média
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.7rem] font-semibold ${getStatusStyles(route.status)}`}
              >
                <span className="hidden text-base leading-none sm:inline" aria-hidden="true">
                  {route.status.toLowerCase().includes("atenção") ? "!" : "●"}
                </span>
                {route.status}
              </span>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"
                style={{ width: `${route.occupancy}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {route.issues === 0 ? "Nenhum incidente registrado hoje" : `Incidentes registrados hoje: ${route.issues}`}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

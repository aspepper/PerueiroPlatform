const routes = [
  {
    name: "Zona Norte",
    vehicles: 18,
    occupancy: 92,
    issues: 1,
    status: "Operação normal"
  },
  {
    name: "Zona Leste",
    vehicles: 21,
    occupancy: 88,
    issues: 2,
    status: "Atenção com atrasos"
  },
  {
    name: "Zona Sul",
    vehicles: 14,
    occupancy: 76,
    issues: 0,
    status: "Operação normal"
  }
];

export default function RoutesOverview() {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Rotas monitoradas</h2>
          <p className="text-sm text-slate-500">Resumo das rotas e lotação dos veículos</p>
        </div>
        <button className="text-sm font-semibold text-primary-600 transition hover:text-primary-700">
          Ver todas
        </button>
      </header>
      <div className="mt-4 space-y-4">
        {routes.map((route) => (
          <div key={route.name} className="rounded-xl border border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">{route.name}</p>
                <p className="text-xs text-slate-400">
                  {route.vehicles} veículos · {route.occupancy}% de ocupação média
                </p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                {route.status}
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary-500"
                style={{ width: `${route.occupancy}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Incidentes registrados hoje: {route.issues}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

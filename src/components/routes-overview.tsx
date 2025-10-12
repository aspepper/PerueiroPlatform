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
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.32)]">
      <div className="pointer-events-none absolute -right-20 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-primary-200/25 blur-3xl" aria-hidden="true" />
      <header className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-600/80">Cobertura urbana</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Rotas monitoradas</h2>
          <p className="text-sm text-slate-500">Resumo das linhas operacionais e nível de ocupação dos veículos</p>
        </div>
        <button className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary-200 hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">
          Ver todas
        </button>
      </header>
      <div className="relative mt-6 space-y-4">
        {routes.map((route) => (
          <div
            key={route.name}
            className="group relative overflow-hidden rounded-[1.9rem] border border-slate-200/70 bg-white/80 p-5 shadow-[0_18px_55px_-40px_rgba(15,23,42,0.28)] transition hover:-translate-y-1 hover:border-primary-200/70 hover:shadow-[0_26px_70px_-38px_rgba(15,23,42,0.3)]"
          >
            <div className="pointer-events-none absolute -right-24 top-0 h-40 w-40 bg-gradient-to-br from-primary-200/25 via-primary-100/10 to-transparent blur-2xl opacity-0 transition duration-300 group-hover:opacity-100" aria-hidden="true" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">{route.name}</p>
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                  {route.vehicles} veículos · {route.occupancy}% de ocupação média
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide ${getStatusStyles(route.status)}`}
              >
                <span className="hidden text-base leading-none sm:inline" aria-hidden="true">
                  {route.status.toLowerCase().includes("atenção") ? "!" : "●"}
                </span>
                {route.status}
              </span>
            </div>
            <div className="relative mt-5 h-2.5 overflow-hidden rounded-full bg-white/70">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600"
                style={{ width: `${route.occupancy}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(120deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_40%)] bg-[length:180%_100%] opacity-0 transition group-hover:opacity-100"
                aria-hidden="true"
              />
            </div>
            <p className="mt-4 text-xs text-slate-500">
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

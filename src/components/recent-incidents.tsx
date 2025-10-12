const incidents = [
  {
    id: "INC-3412",
    type: "Atraso",
    route: "Zona Norte",
    reportedAt: "08:15",
    status: "Resolvido",
  },
  {
    id: "INC-3409",
    type: "Falta",
    route: "Zona Oeste",
    reportedAt: "Ontem",
    status: "Em acompanhamento",
  },
  {
    id: "INC-3404",
    type: "Manutenção",
    route: "Zona Leste",
    reportedAt: "Há 3 dias",
    status: "Aguardando peça",
  },
];

function getStatusBadge(status: string) {
  if (status.toLowerCase().includes("resolvido")) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status.toLowerCase().includes("aguardando")) {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-primary-100 text-primary-700";
}

export default function RecentIncidents() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/75 p-6 shadow-[0_45px_90px_-50px_rgba(15,23,42,0.55)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -left-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-primary-400/20 blur-3xl" aria-hidden />
      <header className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600/70">Central de alertas</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Ocorrências recentes</h2>
          <p className="text-sm text-slate-500">Monitoramento em tempo real das solicitações abertas pelos motoristas</p>
        </div>
        <button className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary-200 hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">
          Ver histórico
        </button>
      </header>
      <div className="relative mt-6 space-y-4">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="group relative flex items-center gap-4 overflow-hidden rounded-[1.9rem] border border-white/60 bg-white/60 p-5 shadow-[0_30px_60px_-45px_rgba(15,23,42,0.45)] backdrop-blur transition hover:-translate-y-1 hover:border-primary-200/70"
          >
            <div className="pointer-events-none absolute -right-16 top-1/2 h-32 w-32 -translate-y-1/2 bg-gradient-to-br from-primary-400/25 via-primary-300/10 to-transparent blur-2xl opacity-0 transition duration-300 group-hover:opacity-100" aria-hidden />
            <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/15 to-primary-400/5 text-primary-600">
              •
            </span>
            <div className="relative flex flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-base font-semibold text-slate-900">
                  {incident.type} · {incident.route}
                </p>
                <span className="rounded-full border border-slate-200/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
                  Protocolo {incident.id}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(incident.status)}`}>
                  {incident.status}
                </span>
                <span className="text-xs font-medium text-slate-500">{incident.reportedAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

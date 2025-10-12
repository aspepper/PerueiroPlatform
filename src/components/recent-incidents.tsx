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
    <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg shadow-slate-900/10 backdrop-blur-xl">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Ocorrências recentes</h2>
          <p className="text-sm text-slate-500">Monitoramento em tempo real das solicitações abertas pelos motoristas</p>
        </div>
        <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary-200 hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">
          Ver histórico
        </button>
      </header>
      <div className="mt-6 space-y-4">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="flex items-center gap-4 rounded-2xl border border-white/50 bg-white/60 p-5 shadow-sm shadow-slate-900/5 backdrop-blur"
          >
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary-500" aria-hidden />
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm font-semibold text-slate-900">
                  {incident.type} · {incident.route}
                </p>
                <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
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

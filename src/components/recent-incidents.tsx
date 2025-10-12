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
    return "bg-emerald-50 text-emerald-700";
  }

  if (status.toLowerCase().includes("aguardando")) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-cyan-50 text-cyan-700";
}

export default function RecentIncidents() {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white px-6 py-7 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Central de alertas</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Ocorrências recentes</h2>
          <p className="text-sm text-slate-500">Monitoramento em tempo real das solicitações abertas pelos motoristas</p>
        </div>
        <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-cyan-200 hover:text-cyan-700">
          Ver histórico
        </button>
      </header>

      <div className="mt-6 space-y-4">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-inner shadow-white/60"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-600">
              •
            </span>
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-base font-semibold text-slate-900">
                  {incident.type} · {incident.route}
                </p>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Protocolo {incident.id}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
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

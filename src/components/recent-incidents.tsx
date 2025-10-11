const incidents = [
  {
    id: "INC-3412",
    type: "Atraso",
    route: "Zona Norte",
    reportedAt: "08:15",
    status: "Resolvido"
  },
  {
    id: "INC-3409",
    type: "Falta",
    route: "Zona Oeste",
    reportedAt: "Ontem",
    status: "Em acompanhamento"
  },
  {
    id: "INC-3404",
    type: "Manutenção",
    route: "Zona Leste",
    reportedAt: "Há 3 dias",
    status: "Aguardando peça"
  }
];

export default function RecentIncidents() {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Ocorrências recentes</h2>
          <p className="text-sm text-slate-500">Monitoramento das solicitações abertas pelos motoristas</p>
        </div>
        <button className="text-sm font-semibold text-primary-600 transition hover:text-primary-700">
          Ver histórico
        </button>
      </header>
      <div className="mt-5 space-y-3">
        {incidents.map((incident) => (
          <div key={incident.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {incident.type} · {incident.route}
              </p>
              <p className="text-xs text-slate-400">Protocolo {incident.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-primary-600">{incident.status}</p>
              <p className="text-xs text-slate-400">{incident.reportedAt}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

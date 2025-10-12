const pendingDrivers = [
  {
    name: "João Mendes",
    since: "2h",
    documents: ["CNH", "Antecedentes"],
    route: "Zona Norte",
  },
  {
    name: "Camila Nunes",
    since: "5h",
    documents: ["Vistoria", "Seguro"],
    route: "Zona Leste",
  },
];

const pendingSchools = [
  { name: "Colégio Horizonte", since: "1 dia", students: 284 },
  { name: "Escola Viva", since: "3 dias", students: 156 },
];

export default function PendingApprovals() {
  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <article className="rounded-3xl border border-slate-200/80 bg-white px-6 py-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Homologação</p>
            <h2 className="text-xl font-semibold text-slate-900">Motoristas aguardando aprovação</h2>
            <p className="text-sm text-slate-500">Documentos enviados pelo app aguardando revisão da equipe</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-1 text-sm font-semibold text-cyan-700">
            <span className="h-2 w-2 rounded-full bg-cyan-500" aria-hidden="true" />
            {pendingDrivers.length}
          </span>
        </header>
        <div className="space-y-4">
          {pendingDrivers.map((driver) => (
            <div key={driver.name} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-inner shadow-white/60">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">{driver.name}</p>
                  <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-slate-400">Rota sugerida · {driver.route}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-700 shadow-sm shadow-cyan-500/20">
                  {driver.since}
                </span>
              </div>
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[0.7rem] font-medium text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" aria-hidden="true" />
                Documentos: {driver.documents.join(", ")}
              </p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-3xl border border-slate-200/80 bg-white px-6 py-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Integração</p>
            <h2 className="text-xl font-semibold text-slate-900">Escolas aguardando integração</h2>
            <p className="text-sm text-slate-500">Solicitações realizadas pelos gestores escolares na última semana</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-1 text-sm font-semibold text-cyan-700">
            <span className="h-2 w-2 rounded-full bg-cyan-500" aria-hidden="true" />
            {pendingSchools.length}
          </span>
        </header>
        <div className="space-y-4">
          {pendingSchools.map((school) => (
            <div key={school.name} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-inner shadow-white/60">
              <div>
                <p className="text-base font-semibold text-slate-900">{school.name}</p>
                <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-slate-400">{school.students} alunos cadastrados</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-700 shadow-sm shadow-cyan-500/20">
                {school.since}
              </span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

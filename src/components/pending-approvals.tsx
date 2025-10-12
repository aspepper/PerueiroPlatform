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
    <section className="grid gap-6 lg:grid-cols-2">
      <article className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg shadow-slate-900/10 backdrop-blur-xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Motoristas aguardando aprovação</h2>
            <p className="text-sm text-slate-500">Documentos enviados pelo app aguardando revisão da equipe</p>
          </div>
          <span className="rounded-full bg-primary-100 px-4 py-1 text-sm font-semibold text-primary-700">
            {pendingDrivers.length}
          </span>
        </header>
        <div className="space-y-4">
          {pendingDrivers.map((driver) => (
            <div
              key={driver.name}
              className="rounded-2xl border border-white/50 bg-white/60 p-5 shadow-sm shadow-slate-900/5 backdrop-blur transition hover:-translate-y-0.5 hover:border-primary-200/80 hover:bg-primary-50/60"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{driver.name}</p>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Rota sugerida · {driver.route}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-600 shadow-sm">
                  {driver.since}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500">Documentos: {driver.documents.join(", ")}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg shadow-slate-900/10 backdrop-blur-xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Escolas aguardando integração</h2>
            <p className="text-sm text-slate-500">Solicitações realizadas pelos gestores escolares na última semana</p>
          </div>
          <span className="rounded-full bg-primary-100 px-4 py-1 text-sm font-semibold text-primary-700">
            {pendingSchools.length}
          </span>
        </header>
        <div className="space-y-4">
          {pendingSchools.map((school) => (
            <div
              key={school.name}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/50 bg-white/60 p-5 shadow-sm shadow-slate-900/5 backdrop-blur transition hover:-translate-y-0.5 hover:border-primary-200/80 hover:bg-primary-50/60"
            >
              <div>
                <p className="font-semibold text-slate-900">{school.name}</p>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{school.students} alunos cadastrados</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-600 shadow-sm">
                {school.since}
              </span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

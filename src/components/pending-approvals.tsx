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
      <article className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-[0_22px_70px_-45px_rgba(15,23,42,0.32)]">
        <div className="pointer-events-none absolute -right-20 top-0 h-48 w-48 bg-gradient-to-br from-primary-200/30 via-primary-100/15 to-transparent blur-2xl" aria-hidden="true" />
        <header className="relative mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-600/80">Homologação</p>
            <h2 className="text-xl font-semibold text-slate-900">Motoristas aguardando aprovação</h2>
            <p className="text-sm text-slate-500">Documentos enviados pelo app aguardando revisão da equipe</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1 text-sm font-semibold text-primary-700 shadow-sm shadow-primary-500/20">
            <span className="h-2 w-2 rounded-full bg-primary-500" aria-hidden="true" />
            {pendingDrivers.length}
          </span>
        </header>
        <div className="relative space-y-4">
          {pendingDrivers.map((driver) => (
            <div
              key={driver.name}
              className="group relative overflow-hidden rounded-[1.6rem] border border-slate-200/70 bg-white/80 p-5 shadow-[0_18px_55px_-40px_rgba(15,23,42,0.28)] transition hover:-translate-y-1 hover:border-primary-200/70"
            >
              <div className="pointer-events-none absolute -right-16 -top-8 h-32 w-32 bg-gradient-to-br from-primary-200/25 via-primary-100/10 to-transparent blur-2xl opacity-0 transition duration-300 group-hover:opacity-100" aria-hidden="true" />
              <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-slate-900">{driver.name}</p>
                  <p className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-slate-400">Rota sugerida · {driver.route}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-600 shadow-sm shadow-primary-500/20">
                  {driver.since}
                </span>
              </div>
              <p className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[0.7rem] font-medium text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-400" aria-hidden="true" />
                Documentos: {driver.documents.join(", ")}
              </p>
            </div>
          ))}
        </div>
      </article>

      <article className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-[0_22px_70px_-45px_rgba(15,23,42,0.32)]">
        <div className="pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full bg-primary-200/25 blur-3xl" aria-hidden="true" />
        <header className="relative mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-600/80">Integração</p>
            <h2 className="text-xl font-semibold text-slate-900">Escolas aguardando integração</h2>
            <p className="text-sm text-slate-500">Solicitações realizadas pelos gestores escolares na última semana</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1 text-sm font-semibold text-primary-700 shadow-sm shadow-primary-500/20">
            <span className="h-2 w-2 rounded-full bg-primary-500" aria-hidden="true" />
            {pendingSchools.length}
          </span>
        </header>
        <div className="relative space-y-4">
          {pendingSchools.map((school) => (
            <div
              key={school.name}
              className="group relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-[1.6rem] border border-slate-200/70 bg-white/80 p-5 shadow-[0_18px_55px_-40px_rgba(15,23,42,0.28)] transition hover:-translate-y-1 hover:border-primary-200/70"
            >
              <div className="pointer-events-none absolute -right-20 top-1/2 h-32 w-32 -translate-y-1/2 bg-gradient-to-r from-primary-200/25 via-primary-100/10 to-transparent blur-2xl opacity-0 transition duration-300 group-hover:opacity-100" aria-hidden="true" />
              <div className="relative">
                <p className="text-base font-semibold text-slate-900">{school.name}</p>
                <p className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-slate-400">{school.students} alunos cadastrados</p>
              </div>
              <span className="relative rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-600 shadow-sm shadow-primary-500/20">
                {school.since}
              </span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

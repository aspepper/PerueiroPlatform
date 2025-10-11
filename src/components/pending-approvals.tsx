const pendingDrivers = [
  {
    name: "João Mendes",
    since: "2h",
    documents: ["CNH", "Antecedentes"],
    route: "Zona Norte"
  },
  {
    name: "Camila Nunes",
    since: "5h",
    documents: ["Vistoria", "Seguro"],
    route: "Zona Leste"
  }
];

const pendingSchools = [
  { name: "Colégio Horizonte", since: "1 dia", students: 284 },
  { name: "Escola Viva", since: "3 dias", students: 156 }
];

export default function PendingApprovals() {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Motoristas aguardando aprovação</h2>
            <p className="text-sm text-slate-500">Documentos enviados pelo app aguardando revisão</p>
          </div>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
            {pendingDrivers.length}
          </span>
        </header>
        <div className="space-y-3">
          {pendingDrivers.map((driver) => (
            <div key={driver.name} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{driver.name}</p>
                  <p className="text-xs text-slate-400">Rota sugerida: {driver.route}</p>
                </div>
                <span className="text-xs font-semibold text-primary-600">{driver.since}</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Documentos: {driver.documents.join(", ")}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Escolas aguardando integração</h2>
            <p className="text-sm text-slate-500">Solicitações feitas pelo app dos gestores escolares</p>
          </div>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
            {pendingSchools.length}
          </span>
        </header>
        <div className="space-y-3">
          {pendingSchools.map((school) => (
            <div key={school.name} className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
              <div>
                <p className="font-semibold text-slate-800">{school.name}</p>
                <p className="text-xs text-slate-400">{school.students} alunos cadastrados</p>
              </div>
              <span className="text-xs font-semibold text-primary-600">{school.since}</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardHeader() {
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <header className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-primary-600">Painel Administrativo</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Bem-vindo ao Perueiros Admin</h1>
        <p className="text-sm text-slate-500">{today}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
          Sincronizar Agora
        </button>
        <button className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary-200 hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
          Exportar Relatório
        </button>
      </div>
    </header>
  );
}

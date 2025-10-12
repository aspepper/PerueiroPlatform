import DashboardHeader from "@/components/dashboard-header";
import FinancialSummary from "@/components/financial-summary";
import MetricsGrid, { type Metric } from "@/components/metrics-grid";
import PendingApprovals from "@/components/pending-approvals";
import RecentIncidents from "@/components/recent-incidents";
import RoutesOverview from "@/components/routes-overview";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Painel administrativo • Perueiros",
  description: "Visão geral dos indicadores operacionais do Perueiros.",
};

async function loadDashboardMetrics() {
  try {
    const [students, drivers, vans, pendingPayments] = await Promise.all([
      prisma.student.count(),
      prisma.driver.count(),
      prisma.van.count(),
      prisma.payment.count({ where: { status: "PENDING" } }),
    ]);

    const metrics: Metric[] = [
      {
        label: "Motoristas cadastrados",
        value: drivers,
        description: "Profissionais ativos vinculados às rotas supervisionadas.",
      },
      {
        label: "Alunos transportados",
        value: students,
        description: "Estudantes acompanhados diariamente nas linhas monitoradas.",
      },
      {
        label: "Vans em operação",
        value: vans,
        description: "Veículos homologados com monitoramento em tempo real.",
      },
      {
        label: "Pagamentos pendentes",
        value: pendingPayments,
        description: "Boletos aguardando confirmação nas próximas cobranças.",
        status: pendingPayments === 0 ? "up" : "down",
        variation: pendingPayments === 0 ? "Tudo em dia" : `${pendingPayments} em aberto`,
      },
    ];

    return { metrics, loadError: false };
  } catch (error) {
    console.error("Failed to load dashboard metrics", error);
    const fallbackMetrics: Metric[] = [
      {
        label: "Motoristas cadastrados",
        value: 0,
        description: "Não foi possível consultar os dados de motoristas.",
      },
      {
        label: "Alunos transportados",
        value: 0,
        description: "Não foi possível consultar os dados de alunos.",
      },
      {
        label: "Vans em operação",
        value: 0,
        description: "Não foi possível consultar os dados de vans.",
      },
      {
        label: "Pagamentos pendentes",
        value: 0,
        description: "Não foi possível consultar os dados financeiros.",
      },
    ];

    return { metrics: fallbackMetrics, loadError: true };
  }
}

export default async function DashboardPage() {
  const { metrics, loadError } = await loadDashboardMetrics();

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-primary-50/60 via-slate-50 to-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-br from-primary-200/60 via-primary-100/50 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute -top-16 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-400/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute right-[8%] top-1/3 -z-10 h-64 w-64 rounded-full bg-slate-300/30 blur-3xl" aria-hidden />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-16 pt-12 lg:px-12">
        <DashboardHeader />

        {loadError ? (
          <p className="rounded-3xl border border-amber-200/80 bg-amber-50/80 px-5 py-4 text-sm font-medium text-amber-800 shadow-sm">
            Não foi possível atualizar todos os indicadores em tempo real. Os números exibidos representam um valor padrão.
          </p>
        ) : null}

        <section className="grid gap-8 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
          <div className="space-y-8">
            <MetricsGrid metrics={metrics} />
            <RoutesOverview />
            <PendingApprovals />
          </div>
          <div className="space-y-8 xl:sticky xl:top-32">
            <FinancialSummary />
            <RecentIncidents />
          </div>
        </section>
      </div>
    </main>
  );
}

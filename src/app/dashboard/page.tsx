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
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
      <DashboardHeader />

      {loadError ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Não foi possível atualizar todos os indicadores em tempo real. Os números exibidos representam um valor padrão.
        </p>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <MetricsGrid metrics={metrics} />
          <RoutesOverview />
          <PendingApprovals />
        </div>
        <div className="space-y-6">
          <FinancialSummary />
          <RecentIncidents />
        </div>
      </section>
    </main>
  );
}

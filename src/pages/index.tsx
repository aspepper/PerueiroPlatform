import Head from "next/head";
import { Suspense } from "react";
import DashboardHeader from "@/components/dashboard-header";
import MetricsGrid from "@/components/metrics-grid";
import PendingApprovals from "@/components/pending-approvals";
import RecentIncidents from "@/components/recent-incidents";
import RoutesOverview from "@/components/routes-overview";
import FinancialSummary from "@/components/financial-summary";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Perueiros Admin</title>
      </Head>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
        <DashboardHeader />
        <Suspense fallback={<p className="text-sm text-slate-500">Carregando dados...</p>}>
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <MetricsGrid />
              <RoutesOverview />
              <PendingApprovals />
            </div>
            <div className="space-y-6">
              <FinancialSummary />
              <RecentIncidents />
            </div>
          </section>
        </Suspense>
      </main>
    </>
  );
}

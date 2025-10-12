import FinancialSummary from "@/components/financial-summary";

export const metadata = {
  title: "Painel administrativo • Perueiros",
  description: "Visão geral dos indicadores operacionais do Perueiros.",
};

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen bg-[#F5F7FB] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl justify-center">
        <FinancialSummary />
      </div>
    </main>
  );
}

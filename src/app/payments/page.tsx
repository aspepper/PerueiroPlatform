import PaymentsRegistry from "./payments-registry";
import RegistryPageShell from "@/components/registry-page-shell";

export const metadata = { title: "Controle de Pagamentos • Perueiro Admin" };

export default function PaymentsPage() {
  return (
    <RegistryPageShell
      title="Controle de pagamentos"
      description="Visualize e filtre as mensalidades geradas automaticamente por van ou por responsável legal, acompanhando vencimentos, valores e situação de cada parcela."
    >
      <PaymentsRegistry />
    </RegistryPageShell>
  );
}

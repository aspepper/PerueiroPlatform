import RegistryPageShell from "@/components/registry-page-shell";

export const metadata = { title: "Controle de Boletos • Perueiro Admin" };

export default function BoletosPage() {
  return (
    <RegistryPageShell
      title="Controle de boletos"
      description="Acompanhe a emissão, conciliação e status de pagamento dos boletos vinculados aos contratos ativos."
    >
      <ul className="list-disc space-y-2 pl-5">
        <li>Gerar cobranças recorrentes e enviar notificações automáticas de vencimento.</li>
        <li>Conciliar pagamentos e exportar relatórios financeiros por período.</li>
        <li>Monitorar inadimplência e configurar políticas de cobrança.</li>
      </ul>
    </RegistryPageShell>
  );
}

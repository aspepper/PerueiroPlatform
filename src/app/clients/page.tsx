import RegistryPageShell from "@/components/registry-page-shell";

export const metadata = { title: "Clientes • Perueiro Admin" };

export default function ClientesPage() {
  return (
    <RegistryPageShell
      title="Clientes corporativos e familiares"
      description="Organize contratos, responsáveis e planos contratados pelos clientes que utilizam a plataforma."
    >
      <ul className="list-disc space-y-2 pl-5">
        <li>Gerenciar contas corporativas e familiares com seus respectivos contratos.</li>
        <li>Controlar planos ativos, períodos de faturamento e formas de pagamento.</li>
        <li>Registrar solicitações específicas e acompanhar indicadores de satisfação.</li>
      </ul>
    </RegistryPageShell>
  );
}

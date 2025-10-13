import RegistryPageShell from "@/components/registry-page-shell";

import ClientsRegistry from "./clients-registry";

export const metadata = { title: "Clientes • Perueiro Admin" };

export default function ClientesPage() {
  return (
    <RegistryPageShell
      title="Clientes corporativos e familiares"
      description="Organize contratos, responsáveis e planos contratados pelos clientes que utilizam a plataforma."
    >
      <ClientsRegistry />
    </RegistryPageShell>
  );
}

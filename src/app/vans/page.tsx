import RegistryPageShell from "@/components/registry-page-shell";

import VansRegistry from "./vans-registry";

export const metadata = { title: "Vans • Perueiro Admin" };

export default function VansPage() {
  return (
    <RegistryPageShell
      title="Vans em operação"
      description="Registre inspeções, lotação e documentação veicular para garantir que cada van esteja pronta para operar com segurança."
    >
      <VansRegistry />
    </RegistryPageShell>
  );
}

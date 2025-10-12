import RegistryPageShell from "@/components/registry-page-shell";

import DriversRegistry from "./drivers-registry";

export const metadata = { title: "Motoristas • Perueiro Admin" };

export default function MotoristasPage() {
  return (
    <RegistryPageShell
      title="Motoristas cadastrados"
      description="Cadastre novos motoristas, revise seus dados pessoais e mantenha o status de documentação sempre atualizado."
    >
      <DriversRegistry />
    </RegistryPageShell>
  );
}

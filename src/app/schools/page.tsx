import RegistryPageShell from "@/components/registry-page-shell";

import SchoolsRegistry from "./schools-registry";

export const metadata = { title: "Escolas • Perueiro Admin" };

export default function EscolasPage() {
  return (
    <RegistryPageShell
      title="Instituições de ensino"
      description="Cadastre escolas, mantenha dados de contato atualizados e associe unidades às rotas operadas."
    >
      <SchoolsRegistry />
    </RegistryPageShell>
  );
}

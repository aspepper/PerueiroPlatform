import RegistryPageShell from "@/components/registry-page-shell";

import StudentsRegistry from "./students-registry";

export const metadata = { title: "Alunos • Perueiro Admin" };

export default function AlunosPage() {
  return (
    <RegistryPageShell
      title="Alunos transportados"
      description="Monitore dados acadêmicos, responsáveis e rotas associadas para cada estudante atendido pela operação."
    >
      <StudentsRegistry />
    </RegistryPageShell>
  );
}

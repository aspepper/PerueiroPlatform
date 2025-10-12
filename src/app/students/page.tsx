import RegistryPageShell from "@/components/registry-page-shell";

export const metadata = { title: "Alunos • Perueiro Admin" };

export default function AlunosPage() {
  return (
    <RegistryPageShell
      title="Alunos transportados"
      description="Monitore dados acadêmicos, responsáveis e rotas associadas para cada estudante atendido pela operação."
    >
      <ul className="list-disc space-y-2 pl-5">
        <li>Cadastrar informações pessoais, necessidades especiais e contatos de emergência.</li>
        <li>Vincular alunos às instituições de ensino e aos veículos correspondentes.</li>
        <li>Consultar histórico de presença e ocorrências relevantes.</li>
      </ul>
    </RegistryPageShell>
  );
}

import RegistryPageShell from "@/components/registry-page-shell";

export const metadata = { title: "Motoristas • Perueiro Admin" };

export default function MotoristasPage() {
  return (
    <RegistryPageShell
      title="Motoristas cadastrados"
      description="Centralize dados pessoais, documentação e status de homologação dos motoristas que operam na rede Perueiro."
    >
      <ul className="list-disc space-y-2 pl-5">
        <li>Importar ou cadastrar motoristas manualmente, incluindo CNH e validade de documentos.</li>
        <li>Acompanhar etapas de homologação e sincronizar com a escala diária de rotas.</li>
        <li>Gerar relatórios de disponibilidade e performance individual.</li>
      </ul>
    </RegistryPageShell>
  );
}

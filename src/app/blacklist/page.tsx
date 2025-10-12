import RegistryPageShell from "@/components/registry-page-shell";

export const metadata = { title: "Lista Negra • Perueiro Admin" };

export default function ListaNegraPage() {
  return (
    <RegistryPageShell
      title="Lista de restrições"
      description="Concentre ocorrências críticas, bloqueios contratuais e impedimentos operacionais para consulta rápida."
      badgeLabel="Controle"
    >
      <ul className="list-disc space-y-2 pl-5">
        <li>Registrar motivos de bloqueio e período de validade das restrições.</li>
        <li>Associar registros a motoristas, veículos, escolas ou clientes impactados.</li>
        <li>Configurar regras de desbloqueio e responsáveis pela revisão de casos.</li>
      </ul>
    </RegistryPageShell>
  );
}

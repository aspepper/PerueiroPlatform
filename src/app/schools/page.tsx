import RegistryPageShell from "@/components/registry-page-shell";

export const metadata = { title: "Escolas • Perueiro Admin" };

export default function EscolasPage() {
  return (
    <RegistryPageShell
      title="Instituições de ensino"
      description="Cadastre escolas, mantenha dados de contato atualizados e associe unidades às rotas operadas."
    >
      <ul className="list-disc space-y-2 pl-5">
        <li>Registrar endereços, horários de entrada e responsáveis por cada unidade escolar.</li>
        <li>Integrar listas de alunos e veículos vinculados à instituição.</li>
        <li>Acompanhar indicadores de atendimento e SLA por escola.</li>
      </ul>
    </RegistryPageShell>
  );
}

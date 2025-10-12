import RegistryPageShell from "@/components/registry-page-shell";

export const metadata = { title: "Vans • Perueiro Admin" };

export default function VansPage() {
  return (
    <RegistryPageShell
      title="Vans em operação"
      description="Registre inspeções, lotação e documentação veicular para garantir que cada van esteja pronta para operar com segurança."
    >
      <ul className="list-disc space-y-2 pl-5">
        <li>Controlar vistorias periódicas, seguro e monitoramento em tempo real.</li>
        <li>Associar veículos aos motoristas e rotas com facilidade.</li>
        <li>Receber alertas sobre vencimentos e manutenção preventiva.</li>
      </ul>
    </RegistryPageShell>
  );
}

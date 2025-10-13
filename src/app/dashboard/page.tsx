import type { ReactNode } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Prisma } from "@prisma/client";

import LogoutButton from "@/components/logout-button";
import { prisma } from "@/lib/prisma";

const cadastroLinks = [
  { label: "Motoristas", href: "/drivers" },
  { label: "Vans", href: "/vans" },
  { label: "Escolas", href: "/schools" },
  { label: "Clientes", href: "/clients" },
  { label: "Alunos", href: "/students" },
  { label: "Controle de Boletos", href: "/payments" },
  { label: "Lista Negra", href: "/blacklist" },
] as const;

export const metadata = { title: "Dashboard • Perueiro Admin" };
export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-[16px] border border-[#E5E7EB] bg-white p-5 ${className}`}>{children}</div>;
}

const formatNumber = (value: number) => value.toLocaleString("pt-BR");

const resolveNetAmount = (
  sum?: { amount: Prisma.Decimal | null; discount: Prisma.Decimal | null } | null,
) => {
  if (!sum) return 0;
  const amount = sum.amount ? Number(sum.amount) : 0;
  const discount = sum.discount ? Number(sum.discount) : 0;
  return amount - discount;
};

const formatCpf = (cpf: string) => {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const formatCurrency = (value: number) => currencyFormatter.format(value);

const describeMissingDriverFields = (driver: {
  cnh: string | null;
  phone: string | null;
  email: string | null;
}) => {
  const missingFields: string[] = [];

  if (!driver.cnh || driver.cnh.trim().length === 0) missingFields.push("CNH");
  if (!driver.phone || driver.phone.trim().length === 0) missingFields.push("Telefone");
  if (!driver.email || driver.email.trim().length === 0) missingFields.push("E-mail");

  return missingFields.length > 0 ? missingFields.join(", ") : "Documentação completa";
};

type DashboardData = Awaited<ReturnType<typeof loadDashboardData>>;

async function loadDashboardData() {
  const [
    driverCount,
    studentCount,
    vanCount,
    schoolCount,
    guardianCount,
    pendingPaymentsCount,
    overduePaymentsCount,
    totalPaymentsSummary,
    pendingPaymentsSummary,
    paidPaymentsSummary,
    overduePaymentsSummary,
    nextCharge,
    topVans,
    pendingDrivers,
    overduePayments,
    studentsWithoutVanCount,
    blacklistedStudentsCount,
  ] = await Promise.all([
    prisma.driver.count(),
    prisma.student.count(),
    prisma.van.count(),
    prisma.school.count(),
    prisma.guardian.count(),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.payment.count({ where: { status: "OVERDUE" } }),
    prisma.payment.aggregate({ _sum: { amount: true, discount: true } }),
    prisma.payment.aggregate({
      where: { status: { in: ["PENDING", "OVERDUE"] } },
      _sum: { amount: true, discount: true },
    }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true, discount: true } }),
    prisma.payment.aggregate({ where: { status: "OVERDUE" }, _sum: { amount: true, discount: true } }),
    prisma.payment.findFirst({
      where: { status: { in: ["PENDING", "OVERDUE"] } },
      orderBy: { dueDate: "asc" },
      select: { dueDate: true },
    }),
    prisma.van.findMany({
      select: {
        id: true,
        model: true,
        color: true,
        plate: true,
        driver: { select: { name: true } },
        _count: { select: { students: true } },
      },
      orderBy: { students: { _count: "desc" } },
      take: 5,
    }),
    prisma.driver.findMany({
      where: {
        OR: [
          { cnh: null },
          { cnh: "" },
          { phone: null },
          { phone: "" },
          { email: null },
          { email: "" },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        cpf: true,
        name: true,
        cnh: true,
        phone: true,
        email: true,
        updatedAt: true,
      },
    }),
    prisma.payment.findMany({
      where: { status: "OVERDUE" },
      include: {
        student: {
          select: {
            name: true,
            guardian: { select: { name: true } },
            school: { select: { name: true } },
          },
        },
      },
      orderBy: { dueDate: "desc" },
      take: 5,
    }),
    prisma.student.count({ where: { vanId: null } }),
    prisma.student.count({ where: { blacklist: true } }),
  ]);

  return {
    driverCount,
    studentCount,
    vanCount,
    schoolCount,
    guardianCount,
    pendingPaymentsCount,
    overduePaymentsCount,
    totalReceivable: resolveNetAmount(totalPaymentsSummary._sum),
    pendingReceivable: resolveNetAmount(pendingPaymentsSummary._sum),
    paidReceivable: resolveNetAmount(paidPaymentsSummary._sum),
    overdueReceivable: resolveNetAmount(overduePaymentsSummary._sum),
    nextChargeDate: nextCharge?.dueDate ?? null,
    topVans,
    pendingDrivers,
    overduePayments,
    studentsWithoutVanCount,
    blacklistedStudentsCount,
  };
}

export default async function Page() {
  const data: DashboardData = await loadDashboardData();

  const now = new Date();
  const formattedDate = format(now, "EEEE, d 'de' MMMM", { locale: ptBR });

  const stats = [
    {
      label: "MOTORISTAS CADASTRADOS",
      value: formatNumber(data.driverCount),
      hint:
        data.pendingDrivers.length > 0
          ? `${data.pendingDrivers.length} aguardando homologação.`
          : "Todos homologados.",
    },
    {
      label: "ALUNOS TRANSPORTADOS",
      value: formatNumber(data.studentCount),
      hint:
        data.studentsWithoutVanCount > 0
          ? `${data.studentsWithoutVanCount} sem rota atribuída.`
          : "Todos vinculados a rotas.",
    },
    {
      label: "VANS EM OPERAÇÃO",
      value: formatNumber(data.vanCount),
      hint:
        data.topVans.length > 0
          ? `${data.topVans[0]._count.students} alunos na ${data.topVans[0].model ?? "van"} ${data.topVans[0].plate}.`
          : "Cadastre vans para iniciar a operação.",
    },
    {
      label: "PAGAMENTOS PENDENTES",
      value: formatNumber(data.pendingPaymentsCount),
      hint:
        data.overduePaymentsCount > 0
          ? `${data.overduePaymentsCount} em atraso.`
          : "Nenhum boleto vencido.",
    },
  ];

  const collectionIndex = data.totalReceivable > 0 ? data.paidReceivable / data.totalReceivable : null;

  const alerts: { id: string; message: string }[] = [];

  data.overduePayments.slice(0, 3).forEach((payment) => {
    const studentName = payment.student?.name ?? "Aluno sem identificação";
    const schoolName = payment.student?.school?.name;
    const amount = Number(payment.amount) - Number(payment.discount ?? 0);
    const dueDateText = format(payment.dueDate, "dd/MM", { locale: ptBR });
    const context = [studentName, schoolName].filter(Boolean).join(" • ");

    alerts.push({
      id: `overdue-${payment.id}`,
      message: `Pagamento em atraso • ${context} • Venceu em ${dueDateText} • ${formatCurrency(amount)}`,
    });
  });

  if (data.studentsWithoutVanCount > 0) {
    alerts.push({
      id: "students-without-van",
      message: `Roteirização pendente • ${data.studentsWithoutVanCount} aluno(s) sem van associada`,
    });
  }

  if (data.blacklistedStudentsCount > 0) {
    alerts.push({
      id: "blacklist",
      message: `Lista negra • ${data.blacklistedStudentsCount} ocorrência(s) aguardando revisão`,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "no-alerts",
      message: "Nenhuma ocorrência crítica registrada nas últimas 24h.",
    });
  }

  const nextSteps: string[] = [];

  if (data.pendingReceivable > 0) {
    nextSteps.push(
      `Acompanhar cobrança de ${formatCurrency(data.pendingReceivable)} em boletos pendentes`,
    );
  }

  if (data.pendingDrivers.length > 0) {
    nextSteps.push(
      `Concluir homologação de ${data.pendingDrivers.length} motorista(s) com pendências documentais`,
    );
  }

  if (data.studentsWithoutVanCount > 0) {
    nextSteps.push(
      `Planejar roteirização para ${data.studentsWithoutVanCount} aluno(s) ainda sem transporte definido`,
    );
  }

  if (alerts.length === 1 && alerts[0].id === "no-alerts") {
    nextSteps.push("Monitorar indicadores: nenhum passo urgente identificado.");
  }

  const cadastroCountMap = new Map<string, number>([
    ["/drivers", data.driverCount],
    ["/vans", data.vanCount],
    ["/schools", data.schoolCount],
    ["/clients", data.guardianCount],
    ["/students", data.studentCount],
    ["/payments", data.pendingPaymentsCount + data.overduePaymentsCount],
    ["/blacklist", data.blacklistedStudentsCount],
  ]);

  return (
    <main className="min-h-screen w-full bg-[#F5F7FB] text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Card className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-1 text-[12px] font-semibold tracking-[0.15em] text-[#6B7280]">
                PAINEL ADMINISTRATIVO • {formattedDate}
              </p>
              <h1 className="text-[28px] font-extrabold text-[#0F1730]">Bem-vindo ao centro de controle Perueiro</h1>
              <p className="mt-1 text-[14px] text-[#6B7280]">
                Visualize indicadores prioritários, antecipe decisões operacionais e mantenha a saúde da operação em equilíbrio.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="h-10 rounded-[12px] bg-[#0F1730] px-4 text-[14px] font-semibold text-white hover:brightness-110">
                Sincronizar agora
              </button>
              <LogoutButton variant="solid" />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[#6B7280]">Cadastros</p>
            <div className="flex flex-wrap items-center gap-2">
              {cadastroLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 rounded-[999px] border border-[#CBD5F5] bg-[#EEF2FF] px-4 py-2 text-[13px] font-semibold text-[#1E3A8A] transition hover:border-[#A5B4FC] hover:bg-[#E0E7FF]"
                >
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#60A5FA]" aria-hidden />
                  <span>{link.label}</span>
                  <span className="rounded-full bg-[#C7D2FE] px-2 py-0.5 text-[11px] font-semibold text-[#1E3A8A]">
                    {formatNumber(cadastroCountMap.get(link.href) ?? 0)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="grid grid-cols-1 gap-6 lg:col-span-2">
            <Card>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {stats.map((item) => (
                  <div key={item.label}>
                    <p className="mb-2 text-[12px] font-semibold tracking-[0.15em] text-[#6B7280]">{item.label}</p>
                    <p className="text-[36px] font-extrabold text-[#0F1730]">{item.value}</p>
                    <p className="mt-1 text-[13px] text-[#6B7280]">{item.hint}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <p className="mb-2 text-[12px] font-semibold tracking-[0.15em] text-[#6B7280]">COBERTURA URBANA</p>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[20px] font-extrabold text-[#0F1730]">Rotas monitoradas</h2>
                <button className="rounded-[8px] border border-[#E5E7EB] px-3 py-1.5 text-[12px]">Ver todas</button>
              </div>
              <div className="space-y-2">
                {data.topVans.slice(0, 3).map((van) => {
                  const descriptionParts = [van.model ?? "Van", van.color].filter(Boolean);
                  const description = descriptionParts.join(" • ") || "Van";
                  const driverName = van.driver?.name ? `Motorista ${van.driver.name}` : "Sem motorista vinculado";
                  const studentCount = van._count.students;

                  return (
                    <div
                      key={van.id}
                      className="rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[14px]"
                    >
                      <div className="font-semibold text-[#111827]">
                        {description} • Placa {van.plate}
                      </div>
                      <div className="text-[13px] text-[#6B7280]">
                        {formatNumber(studentCount)} aluno(s) transportados • {driverName}
                      </div>
                    </div>
                  );
                })}
                {data.topVans.length === 0 ? (
                  <div className="rounded-[12px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[14px] text-[#6B7280]">
                    Cadastre vans e distribua alunos para visualizar o monitoramento das rotas.
                  </div>
                ) : null}
              </div>
            </Card>

            <Card>
              <p className="mb-2 text-[12px] font-semibold tracking-[0.15em] text-[#6B7280]">HOMOLOGAÇÃO</p>
              <h2 className="mb-3 text-[20px] font-extrabold text-[#0F1730]">Motoristas aguardando aprovação</h2>
              <div className="space-y-2">
                {data.pendingDrivers.map((driver) => {
                  const missing = describeMissingDriverFields(driver);
                  const lastUpdate = formatDistanceToNow(driver.updatedAt, {
                    addSuffix: true,
                    locale: ptBR,
                  });

                  return (
                    <div
                      key={driver.cpf}
                      className="rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[14px]"
                    >
                      <div className="font-semibold text-[#111827]">
                        {driver.name} • CPF {formatCpf(driver.cpf)}
                      </div>
                      <div className="text-[13px] text-[#6B7280]">
                        Pendências: {missing} • Atualizado {lastUpdate}
                      </div>
                    </div>
                  );
                })}
                {data.pendingDrivers.length === 0 ? (
                  <div className="rounded-[12px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[14px] text-[#6B7280]">
                    Nenhum motorista com pendências de homologação no momento.
                  </div>
                ) : null}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card>
              <p className="mb-2 text-[12px] font-semibold tracking-[0.15em] text-[#6B7280]">SAÚDE FINANCEIRA</p>
              <h2 className="text-[20px] font-extrabold text-[#0F1730]">Resumo financeiro</h2>
              <p className="mt-1 text-[13px] text-[#6B7280]">Situação atual do fluxo de recebimentos da plataforma</p>
              <p className="mt-4 text-[12px] font-semibold tracking-[0.15em] text-[#6B7280]">RECEITA PROJETADA</p>
              <p className="text-[36px] font-extrabold text-[#0F1730]">{formatCurrency(data.totalReceivable)}</p>
              <div className="mt-3 space-y-1 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Inadimplência atual</span>
                  <span className="text-[#111827]">{formatCurrency(data.overdueReceivable)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Próxima rodada de cobranças</span>
                  <span className="text-[#111827]">
                    {data.nextChargeDate ? format(data.nextChargeDate, "dd/MM/yyyy", { locale: ptBR }) : "Sem agenda"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Índice de arrecadação</span>
                  <span className="text-[#111827]">
                    {collectionIndex !== null ? `${(collectionIndex * 100).toFixed(1)}%` : "--"} (meta 95%)
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <p className="mb-2 text-[12px] font-semibold tracking-[0.15em] text-[#6B7280]">CENTRAL DE ALERTAS</p>
              <h2 className="mb-3 text-[20px] font-extrabold text-[#0F1730]">Ocorrências recentes</h2>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="mb-2 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[14px]"
                >
                  {alert.message}
                </div>
              ))}
            </Card>

            <Card>
              <p className="mb-2 text-[12px] font-semibold tracking-[0.15em] text-[#6B7280]">PRÓXIMOS PASSOS</p>
              <ul className="list-disc pl-5 text-[14px]">
                {nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const formatCpf = (cpf: string | null | undefined) => {
  if (!cpf) return "—";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const formatDueDate = (dueDate: string) => {
  try {
    return format(new Date(dueDate), "dd/MM/yyyy", { locale: ptBR });
  } catch (error) {
    return "—";
  }
};

const resolveStatusLabel = (status: string) => {
  switch (status) {
    case "PAID":
      return "Pago";
    case "OVERDUE":
      return "Em atraso";
    default:
      return "Pendente";
  }
};

const resolveStatusClassName = (status: string) => {
  switch (status) {
    case "PAID":
      return "bg-[#DCFCE7] text-[#166534]";
    case "OVERDUE":
      return "bg-[#FEE2E2] text-[#B91C1C]";
    default:
      return "bg-[#FEF3C7] text-[#92400E]";
  }
};

type PaymentRecord = {
  id: string;
  studentName: string | null;
  guardianName: string | null;
  guardianCpf: string | null;
  vanId: string | null;
  vanModel: string | null;
  vanPlate: string | null;
  vanOwnerName: string | null;
  vanOwnerCpf: string | null;
  dueDate: string;
  status: "PENDING" | "OVERDUE" | "PAID";
  netAmount: number;
};

type GroupOption = {
  id: string;
  label: string;
  description?: string;
};

const CURRENT_YEAR = new Date().getFullYear();

export default function PaymentsRegistry() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<"van" | "guardian">("van");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  useEffect(() => {
    const controller = new AbortController();

    const loadPayments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/payments/${year}`, {
          signal: controller.signal,
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.error ?? "Não foi possível carregar os pagamentos.");
        }

        const fetchedPayments: PaymentRecord[] = (payload?.payments ?? []).map(
          (payment: any) => {
            const status = (payment.status ?? "PENDING") as PaymentRecord["status"];
            const parsedNet = Number(payment.netAmount ?? 0);

            return {
              id: payment.id,
              studentName: payment.studentName ?? null,
              guardianName: payment.guardianName ?? null,
              guardianCpf: payment.guardianCpf ?? null,
              vanId: payment.vanId ?? null,
              vanModel: payment.vanModel ?? null,
              vanPlate: payment.vanPlate ?? null,
              vanOwnerName: payment.vanOwnerName ?? null,
              vanOwnerCpf: payment.vanOwnerCpf ?? null,
              dueDate: payment.dueDate,
              status,
              netAmount: Number.isFinite(parsedNet) ? parsedNet : 0,
            };
          },
        );

        setPayments(fetchedPayments);
        setHasLoaded(true);
      } catch (loadError) {
        if ((loadError as Error).name === "AbortError") return;
        setError((loadError as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadPayments();

    return () => {
      controller.abort();
    };
  }, [year]);

  useEffect(() => {
    setSelectedGroup("all");
  }, [viewMode]);

  const vanGroups = useMemo<GroupOption[]>(() => {
    const groups = new Map<string, GroupOption>();
    payments.forEach((payment) => {
      const id = payment.vanId ?? "__none";
      if (groups.has(id)) return;
      const label = payment.vanModel && payment.vanPlate
        ? `${payment.vanModel} • ${payment.vanPlate}`
        : "Sem van vinculada";
      groups.set(id, {
        id,
        label,
        description: payment.vanOwnerName
          ? `Motorista: ${payment.vanOwnerName}`
          : undefined,
      });
    });

    return Array.from(groups.values()).sort((a, b) =>
      a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }),
    );
  }, [payments]);

  const guardianGroups = useMemo<GroupOption[]>(() => {
    const groups = new Map<string, GroupOption>();
    payments.forEach((payment) => {
      const id = payment.guardianCpf ?? "__none";
      if (groups.has(id)) return;
      const label = payment.guardianName ?? "Responsável não identificado";
      groups.set(id, {
        id,
        label,
        description: payment.guardianCpf
          ? `CPF: ${formatCpf(payment.guardianCpf)}`
          : undefined,
      });
    });

    return Array.from(groups.values()).sort((a, b) =>
      a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }),
    );
  }, [payments]);

  const groupOptions = viewMode === "van" ? vanGroups : guardianGroups;

  useEffect(() => {
    if (selectedGroup === "all") return;
    if (!groupOptions.some((option) => option.id === selectedGroup)) {
      setSelectedGroup("all");
    }
  }, [groupOptions, selectedGroup]);

  const filteredPayments = useMemo(() => {
    if (selectedGroup === "all") return payments;

    if (viewMode === "van") {
      const groupId = selectedGroup === "__none" ? null : selectedGroup;
      return payments.filter((payment) => payment.vanId === groupId);
    }

    const groupId = selectedGroup === "__none" ? null : selectedGroup;
    return payments.filter((payment) => payment.guardianCpf === groupId);
  }, [payments, selectedGroup, viewMode]);

  const totals = useMemo(() => {
    return filteredPayments.reduce(
      (acc, payment) => {
        const value = payment.netAmount;
        acc.total += value;
        acc.totalCount += 1;

        if (payment.status === "PAID") {
          acc.paid += value;
          acc.paidCount += 1;
        } else {
          acc.pending += value;
          acc.pendingCount += 1;
          if (payment.status === "OVERDUE") {
            acc.overdueCount += 1;
          }
        }

        return acc;
      },
      { total: 0, pending: 0, paid: 0, totalCount: 0, pendingCount: 0, paidCount: 0, overdueCount: 0 },
    );
  }, [filteredPayments]);

  const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setYear(Number(event.target.value));
  };

  const handleViewModeChange = (mode: "van" | "guardian") => {
    setViewMode(mode);
  };

  const handleGroupChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroup(event.target.value);
  };

  const yearOptions = useMemo(() => {
    const base = CURRENT_YEAR;
    const values = [base + 1, base, base - 1, base - 2];
    if (!values.includes(year)) values.push(year);
    return Array.from(new Set(values)).sort((a, b) => b - a);
  }, [year]);

  const tableEmptyState = () => {
    if (isLoading) {
      return "Carregando pagamentos...";
    }

    if (error && !hasLoaded) {
      return error;
    }

    if (hasLoaded && payments.length === 0) {
      return "Nenhum pagamento cadastrado para o ano selecionado.";
    }

    if (filteredPayments.length === 0) {
      return "Nenhum pagamento encontrado para o filtro aplicado.";
    }

    return null;
  };

  const emptyStateMessage = tableEmptyState();
  const selectedDescription =
    selectedGroup === "all" ? "" : optionDescription(groupOptions, selectedGroup) ?? "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-col">
            <label htmlFor="payments-year" className="text-sm font-medium text-[#374151]">
              Ano de referência
            </label>
            <select
              id="payments-year"
              value={year}
              onChange={handleYearChange}
              className="mt-1 rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
            >
              {yearOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleViewModeChange("van")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                viewMode === "van"
                  ? "bg-[#4338CA] text-white shadow"
                  : "border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6]"
              }`}
            >
              Visão por vans
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange("guardian")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                viewMode === "guardian"
                  ? "bg-[#4338CA] text-white shadow"
                  : "border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6]"
              }`}
            >
              Visão por clientes
            </button>
          </div>
        </div>
        {groupOptions.length > 0 && (
          <div className="flex flex-col">
            <label htmlFor="payments-group" className="text-sm font-medium text-[#374151]">
              {viewMode === "van" ? "Filtrar por van" : "Filtrar por responsável"}
            </label>
            <select
              id="payments-group"
              value={selectedGroup}
              onChange={handleGroupChange}
              className="mt-1 rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
            >
              <option value="all">Todas as {viewMode === "van" ? "vans" : "pessoas"}</option>
              {groupOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {selectedGroup !== "all" && selectedDescription && (
              <span className="mt-1 text-xs text-[#6B7280]">{selectedDescription}</span>
            )}
          </div>
        )}
      </div>

      {error && hasLoaded && (
        <div className="rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">Pagamentos listados</p>
          <p className="mt-2 text-2xl font-semibold text-[#111827]">{totals.totalCount}</p>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">Valor total</p>
          <p className="mt-2 text-2xl font-semibold text-[#111827]">{formatCurrency(totals.total)}</p>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">Pendentes</p>
          <p className="mt-2 text-lg font-semibold text-[#B45309]">
            {totals.pendingCount} • {formatCurrency(totals.pending)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">Pagos</p>
          <p className="mt-2 text-lg font-semibold text-[#15803D]">
            {totals.paidCount} • {formatCurrency(totals.paid)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E5E7EB] text-sm">
            <thead className="bg-[#F9FAFB] text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              <tr>
                <th scope="col" className="px-6 py-4">Vencimento</th>
                <th scope="col" className="px-6 py-4">Aluno</th>
                <th scope="col" className="px-6 py-4">Responsável</th>
                <th scope="col" className="px-6 py-4">Van</th>
                <th scope="col" className="px-6 py-4">Motorista</th>
                <th scope="col" className="px-6 py-4 text-right">Valor</th>
                <th scope="col" className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] text-[#111827]">
              {emptyStateMessage ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-[#6B7280]">
                    {emptyStateMessage}
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-6 py-4 text-[#4B5563]">{formatDueDate(payment.dueDate)}</td>
                    <td className="px-6 py-4 font-medium">{payment.studentName ?? "Aluno não identificado"}</td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      <div className="flex flex-col">
                        <span>{payment.guardianName ?? "Responsável não informado"}</span>
                        <span className="text-xs text-[#9CA3AF]">{formatCpf(payment.guardianCpf)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      <div className="flex flex-col">
                        <span>
                          {payment.vanModel && payment.vanPlate
                            ? `${payment.vanModel} • ${payment.vanPlate}`
                            : "Sem van associada"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {payment.vanOwnerName ?? "Não informado"}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {formatCurrency(payment.netAmount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${resolveStatusClassName(
                          payment.status,
                        )}`}
                      >
                        {resolveStatusLabel(payment.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function optionDescription(options: GroupOption[], id: string) {
  const option = options.find((item) => item.id === id);
  return option?.description;
}

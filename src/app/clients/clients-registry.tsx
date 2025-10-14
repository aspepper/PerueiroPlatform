"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type ClientRecord = {
  cpf: string;
  name: string;
  kinship: string;
  birthDate: string | null;
  spouseName: string | null;
  address: string;
  mobile: string;
  landline: string | null;
  workAddress: string | null;
  workPhone: string | null;
};

type ClientFormState = {
  cpf: string;
  name: string;
  kinship: string;
  birthDate: string;
  spouseName: string;
  address: string;
  mobile: string;
  landline: string;
  workAddress: string;
  workPhone: string;
};

const EMPTY_FORM_STATE: ClientFormState = {
  cpf: "",
  name: "",
  kinship: "",
  birthDate: "",
  spouseName: "",
  address: "",
  mobile: "",
  landline: "",
  workAddress: "",
  workPhone: "",
};

const KINSHIP_OPTIONS = [
  "Mãe",
  "Pai",
  "Responsável Legal",
  "Avó",
  "Avô",
] as const;

const normalizeKinship = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const match = KINSHIP_OPTIONS.find(
    (option) => option.localeCompare(trimmed, "pt-BR", { sensitivity: "base" }) === 0,
  );

  return match ?? trimmed;
};

const normalizeOptionalValue = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const formatDateForInput = (value: string | null) => {
  if (!value) return "";
  try {
    return value.slice(0, 10);
  } catch (error) {
    return "";
  }
};

const formatDateForDisplay = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(date);
};

export default function ClientsRegistry() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [hasLoadedClients, setHasLoadedClients] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [formState, setFormState] = useState<ClientFormState>(EMPTY_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCpf, setEditingCpf] = useState<string | null>(null);
  const [processingDeleteCpf, setProcessingDeleteCpf] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadClients = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/clients", {
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(
            payload.error ?? "Não foi possível carregar os clientes.",
          );
        }

        const payload = await response.json();
        const fetchedClients: ClientRecord[] = (payload?.clients ?? []).map(
          (client: ClientRecord) => ({
            cpf: client.cpf,
            name: client.name,
            kinship: normalizeKinship(client.kinship),
            birthDate: client.birthDate ?? null,
            spouseName: client.spouseName ?? null,
            address: client.address,
            mobile: client.mobile,
            landline: client.landline ?? null,
            workAddress: client.workAddress ?? null,
            workPhone: client.workPhone ?? null,
          }),
        );

        setClients(fetchedClients);
        setHasLoadedClients(true);
      } catch (loadError) {
        if ((loadError as Error).name === "AbortError") return;
        setError((loadError as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadClients();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredClients = useMemo(() => {
    const normalizedQuery = appliedFilter.trim().toLowerCase();

    const results = clients.filter((client) => {
      if (!normalizedQuery) return true;

      return [
        client.name,
        client.cpf,
        client.kinship,
        client.address,
        client.mobile,
        client.landline ?? "",
        client.workAddress ?? "",
        client.workPhone ?? "",
      ]
        .map((value) => value.toLowerCase())
        .some((value) => value.includes(normalizedQuery));
    });

    return [...results].sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }),
    );
  }, [appliedFilter, clients]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilter, pageSize, filteredClients.length]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const openCreateDialog = () => {
    setDialogMode("create");
    setFormState(EMPTY_FORM_STATE);
    setFormError(null);
    setEditingCpf(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (client: ClientRecord) => {
    setDialogMode("edit");
    setFormState({
      cpf: client.cpf,
      name: client.name,
      kinship: normalizeKinship(client.kinship),
      birthDate: formatDateForInput(client.birthDate),
      spouseName: client.spouseName ?? "",
      address: client.address,
      mobile: client.mobile,
      landline: client.landline ?? "",
      workAddress: client.workAddress ?? "",
      workPhone: client.workPhone ?? "",
    });
    setFormError(null);
    setEditingCpf(client.cpf);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    if (isSubmitting) return;
    setIsDialogOpen(false);
    setFormState(EMPTY_FORM_STATE);
    setEditingCpf(null);
    setFormError(null);
  };

  const handleSearch = () => {
    setAppliedFilter(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setAppliedFilter("");
  };

  const handleChangePageSize = (event: ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
  };

  const handleChangePage = (direction: "prev" | "next") => {
    setCurrentPage((prev) => {
      if (direction === "prev") {
        return Math.max(1, prev - 1);
      }

      return Math.min(totalPages, prev + 1);
    });
  };

  const handleFormChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormState((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = formState.name.trim();
    const trimmedCpf = formState.cpf.trim();
    const trimmedKinship = normalizeKinship(formState.kinship);
    const trimmedAddress = formState.address.trim();
    const trimmedMobile = formState.mobile.trim();

    if (!trimmedCpf || !trimmedName || !trimmedKinship || !trimmedAddress || !trimmedMobile) {
      setFormError("CPF, nome, vínculo, endereço e celular são obrigatórios.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      setError(null);

      const payload = {
        cpf: trimmedCpf,
        name: trimmedName,
        kinship: trimmedKinship,
        address: trimmedAddress,
        mobile: trimmedMobile,
        birthDate: formState.birthDate ? formState.birthDate : null,
        spouseName: normalizeOptionalValue(formState.spouseName),
        landline: normalizeOptionalValue(formState.landline),
        workAddress: normalizeOptionalValue(formState.workAddress),
        workPhone: normalizeOptionalValue(formState.workPhone),
      };

      const response = await fetch(
        dialogMode === "create"
          ? "/api/clients"
          : `/api/clients/${encodeURIComponent(editingCpf ?? "")}`,
        {
          method: dialogMode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const responseBody = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          responseBody.error ??
            (dialogMode === "create"
              ? "Não foi possível cadastrar o cliente."
              : "Não foi possível atualizar o cliente."),
        );
      }

      const updatedClient: ClientRecord = {
        cpf: responseBody.client.cpf,
        name: responseBody.client.name,
        kinship: responseBody.client.kinship,
        birthDate: responseBody.client.birthDate ?? null,
        spouseName: responseBody.client.spouseName ?? null,
        address: responseBody.client.address,
        mobile: responseBody.client.mobile,
        landline: responseBody.client.landline ?? null,
        workAddress: responseBody.client.workAddress ?? null,
        workPhone: responseBody.client.workPhone ?? null,
      };

      setClients((previous) => {
        if (dialogMode === "create") {
          return [...previous, updatedClient];
        }

        return previous.map((client) =>
          client.cpf === updatedClient.cpf ? updatedClient : client,
        );
      });
      setHasLoadedClients(true);
      setIsDialogOpen(false);
      setFormState(EMPTY_FORM_STATE);
      setEditingCpf(null);
    } catch (submitError) {
      setFormError((submitError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (client: ClientRecord) => {
    const confirmed = window.confirm(
      `Tem certeza de que deseja remover o cliente ${client.name}? Essa ação não pode ser desfeita.`,
    );

    if (!confirmed) return;

    try {
      setProcessingDeleteCpf(client.cpf);
      setError(null);

      const response = await fetch(
        `/api/clients/${encodeURIComponent(client.cpf)}`,
        { method: "DELETE" },
      );

      const responseBody = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          responseBody.error ?? "Não foi possível remover o cliente.",
        );
      }

      setClients((previous) =>
        previous.filter((existing) => existing.cpf !== client.cpf),
      );
      setHasLoadedClients(true);
    } catch (deleteError) {
      setError((deleteError as Error).message);
    } finally {
      setProcessingDeleteCpf(null);
    }
  };

  const tableEmptyState = () => {
    if (isLoading) {
      return "Carregando clientes...";
    }

    if (error && !hasLoadedClients) {
      return error;
    }

    if (hasLoadedClients && clients.length === 0) {
      return "Nenhum cliente cadastrado";
    }

    return "Nenhum cliente encontrado. Ajuste a busca ou limpe os filtros para ver todos os registros.";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#4B5563]">
          Organize contratos, responsáveis e planos contratados pelos clientes que utilizam a plataforma.
        </p>
        <button
          type="button"
          onClick={openCreateDialog}
          className="inline-flex items-center justify-center rounded-full bg-[#4338CA] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3730A3]"
        >
          + Adicionar cliente
        </button>
      </div>

      {error && hasLoadedClients && (
        <div className="rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="client-search">
            Buscar cliente
          </label>
          <input
            id="client-search"
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Busque por nome, CPF, endereço ou telefone"
            className="w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSearch}
              className="rounded-xl bg-[#4338CA] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3730A3]"
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={handleClearSearch}
              className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#4B5563] transition hover:bg-[#F3F4F6]"
            >
              Limpar
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="clients-page-size" className="text-sm font-medium text-[#4B5563]">
            Linhas por página
          </label>
          <select
            id="clients-page-size"
            value={pageSize}
            onChange={handleChangePageSize}
            className="rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-3 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
          >
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E5E7EB] text-sm">
            <thead className="bg-[#F9FAFB] text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              <tr>
                <th scope="col" className="px-6 py-4">
                  CPF
                </th>
                <th scope="col" className="px-6 py-4">
                  Nome
                </th>
                <th scope="col" className="px-6 py-4">
                  Vínculo
                </th>
                <th scope="col" className="px-6 py-4">
                  Contatos
                </th>
                <th scope="col" className="px-6 py-4">
                  Endereço
                </th>
                <th scope="col" className="px-6 py-4">
                  Nascimento
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] text-[#111827]">
              {paginatedClients.length > 0 ? (
                paginatedClients.map((client) => (
                  <tr key={client.cpf} className="hover:bg-[#F9FAFB]">
                    <td className="px-6 py-4 font-mono text-xs text-[#4B5563]">
                      {client.cpf}
                    </td>
                    <td className="px-6 py-4 font-medium">{client.name}</td>
                    <td className="px-6 py-4 text-[#4B5563]">{client.kinship}</td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {[client.mobile, client.landline]
                        .filter((value) => value)
                        .join(" • ") || "—"}
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {client.address}
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {formatDateForDisplay(client.birthDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDialog(client)}
                          className="rounded-full border border-[#4338CA] px-3 py-1 text-xs font-semibold text-[#4338CA] transition hover:bg-[#EEF2FF]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(client)}
                          disabled={processingDeleteCpf === client.cpf}
                          className="rounded-full border border-[#F87171] px-3 py-1 text-xs font-semibold text-[#B91C1C] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {processingDeleteCpf === client.cpf
                            ? "Excluindo..."
                            : "Excluir"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-[#6B7280]">
                    {tableEmptyState()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#E5E7EB] bg-[#F9FAFB] px-6 py-4 text-sm text-[#4B5563] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Exibindo {paginatedClients.length} de {filteredClients.length} cliente(s)
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleChangePage("prev")}
              disabled={currentPage === 1}
              className="rounded-full border border-[#E5E7EB] px-3 py-1 text-sm font-semibold text-[#4B5563] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="font-semibold text-[#1F2937]">
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => handleChangePage("next")}
              disabled={currentPage === totalPages}
              className="rounded-full border border-[#E5E7EB] px-3 py-1 text-sm font-semibold text-[#4B5563] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1730]/30 px-4 py-8">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0F1730]">
                {dialogMode === "create" ? "Adicionar cliente" : "Editar cliente"}
              </h2>
              <button
                type="button"
                onClick={closeDialog}
                className="rounded-full p-2 text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
                aria-label="Fechar formulário"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="client-name" className="block text-sm font-medium text-[#374151]">
                    Nome completo
                  </label>
                  <input
                    id="client-name"
                    name="name"
                    value={formState.name}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="Digite o nome do responsável"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="client-kinship" className="block text-sm font-medium text-[#374151]">
                    Vínculo com o aluno
                  </label>
                  <select
                    id="client-kinship"
                    name="kinship"
                    value={formState.kinship}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    required
                  >
                    <option value="" disabled>
                      Selecione o vínculo
                    </option>
                    {KINSHIP_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="client-cpf" className="block text-sm font-medium text-[#374151]">
                    CPF
                  </label>
                  <input
                    id="client-cpf"
                    name="cpf"
                    value={formState.cpf}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20 disabled:opacity-60"
                    placeholder="000.000.000-00"
                    required
                    disabled={dialogMode === "edit"}
                  />
                </div>
                <div>
                  <label htmlFor="client-birthDate" className="block text-sm font-medium text-[#374151]">
                    Data de nascimento
                  </label>
                  <input
                    id="client-birthDate"
                    name="birthDate"
                    type="date"
                    value={formState.birthDate}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                  />
                </div>
                <div>
                  <label htmlFor="client-mobile" className="block text-sm font-medium text-[#374151]">
                    Celular principal
                  </label>
                  <input
                    id="client-mobile"
                    name="mobile"
                    value={formState.mobile}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="client-landline" className="block text-sm font-medium text-[#374151]">
                    Telefone fixo
                  </label>
                  <input
                    id="client-landline"
                    name="landline"
                    value={formState.landline}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="(00) 0000-0000"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="client-address" className="block text-sm font-medium text-[#374151]">
                    Endereço residencial
                  </label>
                  <input
                    id="client-address"
                    name="address"
                    value={formState.address}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="Rua, número, bairro, cidade"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="client-spouse" className="block text-sm font-medium text-[#374151]">
                    Nome do cônjuge
                  </label>
                  <input
                    id="client-spouse"
                    name="spouseName"
                    value={formState.spouseName}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label htmlFor="client-workPhone" className="block text-sm font-medium text-[#374151]">
                    Telefone comercial
                  </label>
                  <input
                    id="client-workPhone"
                    name="workPhone"
                    value={formState.workPhone}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="(00) 0000-0000"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="client-workAddress" className="block text-sm font-medium text-[#374151]">
                    Endereço comercial
                  </label>
                  <input
                    id="client-workAddress"
                    name="workAddress"
                    value={formState.workAddress}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="Local de trabalho ou referência"
                  />
                </div>
              </div>

              {formError && (
                <p className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-2 text-sm text-[#B91C1C]">
                  {formError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#4B5563] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#4338CA] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3730A3] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? dialogMode === "create"
                      ? "Salvando..."
                      : "Atualizando..."
                    : dialogMode === "create"
                      ? "Cadastrar cliente"
                      : "Salvar alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

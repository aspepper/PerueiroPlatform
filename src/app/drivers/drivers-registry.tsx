"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type DriverRecord = {
  cpf: string;
  name: string;
  cnh: string | null;
  phone: string | null;
  email: string | null;
};

type DriverFormState = {
  cpf: string;
  name: string;
  cnh: string;
  phone: string;
  email: string;
};

const EMPTY_FORM_STATE: DriverFormState = {
  cpf: "",
  name: "",
  cnh: "",
  phone: "",
  email: "",
};

const normalizeOptionalValue = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export default function DriversRegistry() {
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [hasLoadedDrivers, setHasLoadedDrivers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [formState, setFormState] = useState<DriverFormState>(EMPTY_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCpf, setEditingCpf] = useState<string | null>(null);
  const [processingDeleteCpf, setProcessingDeleteCpf] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadDrivers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/drivers", {
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? "Não foi possível carregar os motoristas.");
        }

        const payload = await response.json();
        const fetchedDrivers: DriverRecord[] = (payload?.drivers ?? []).map(
          (driver: DriverRecord) => ({
            cpf: driver.cpf,
            name: driver.name,
            cnh: driver.cnh ?? null,
            phone: driver.phone ?? null,
            email: driver.email ?? null,
          }),
        );

        setDrivers(fetchedDrivers);
        setHasLoadedDrivers(true);
      } catch (loadError) {
        if ((loadError as Error).name === "AbortError") return;
        setError((loadError as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDrivers();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredDrivers = useMemo(() => {
    const normalizedQuery = appliedFilter.trim().toLowerCase();

    const results = drivers.filter((driver) => {
      if (!normalizedQuery) return true;

      return [
        driver.name,
        driver.cpf,
        driver.cnh ?? "",
        driver.phone ?? "",
        driver.email ?? "",
      ]
        .map((value) => value.toLowerCase())
        .some((value) => value.includes(normalizedQuery));
    });

    return [...results].sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }),
    );
  }, [appliedFilter, drivers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilter, pageSize, filteredDrivers.length]);

  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / pageSize));
  const paginatedDrivers = filteredDrivers.slice(
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

  const openEditDialog = (driver: DriverRecord) => {
    setDialogMode("edit");
    setFormState({
      cpf: driver.cpf,
      name: driver.name,
      cnh: driver.cnh ?? "",
      phone: driver.phone ?? "",
      email: driver.email ?? "",
    });
    setFormError(null);
    setEditingCpf(driver.cpf);
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
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    setFormState((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = formState.name.trim();
    const trimmedCpf = formState.cpf.trim();

    if (!trimmedName || !trimmedCpf) {
      setFormError("Nome e CPF são obrigatórios.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      setError(null);

      const payload = {
        name: trimmedName,
        cpf: trimmedCpf,
        cnh: normalizeOptionalValue(formState.cnh),
        phone: normalizeOptionalValue(formState.phone),
        email: normalizeOptionalValue(formState.email),
      };

      const response = await fetch(
        dialogMode === "create"
          ? "/api/drivers"
          : `/api/drivers/${encodeURIComponent(editingCpf ?? "")}`,
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
              ? "Não foi possível cadastrar o motorista."
              : "Não foi possível atualizar o motorista."),
        );
      }

      const updatedDriver: DriverRecord = {
        cpf: responseBody.driver.cpf,
        name: responseBody.driver.name,
        cnh: responseBody.driver.cnh ?? null,
        phone: responseBody.driver.phone ?? null,
        email: responseBody.driver.email ?? null,
      };

      setDrivers((previous) => {
        if (dialogMode === "create") {
          return [...previous, updatedDriver];
        }

        return previous.map((driver) =>
          driver.cpf === updatedDriver.cpf ? updatedDriver : driver,
        );
      });
      setHasLoadedDrivers(true);
      setIsDialogOpen(false);
      setFormState(EMPTY_FORM_STATE);
      setEditingCpf(null);
    } catch (submitError) {
      setFormError((submitError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (driver: DriverRecord) => {
    const confirmed = window.confirm(
      `Tem certeza de que deseja remover o motorista ${driver.name}? Essa ação não pode ser desfeita.`,
    );

    if (!confirmed) return;

    try {
      setProcessingDeleteCpf(driver.cpf);
      setError(null);

      const response = await fetch(
        `/api/drivers/${encodeURIComponent(driver.cpf)}`,
        { method: "DELETE" },
      );

      const responseBody = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          responseBody.error ?? "Não foi possível remover o motorista.",
        );
      }

      setDrivers((previous) =>
        previous.filter((existing) => existing.cpf !== driver.cpf),
      );
      setHasLoadedDrivers(true);
    } catch (deleteError) {
      setError((deleteError as Error).message);
    } finally {
      setProcessingDeleteCpf(null);
    }
  };

  const tableEmptyState = () => {
    if (isLoading) {
      return "Carregando motoristas...";
    }

    if (error && !hasLoadedDrivers) {
      return error;
    }

    if (hasLoadedDrivers && drivers.length === 0) {
      return "Nenhum usuário cadastrado como motorista";
    }

    return "Nenhum motorista encontrado. Ajuste a busca ou limpe os filtros para ver todos os registros.";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#4B5563]">
          Gerencie o cadastro dos motoristas que atuam na operação e mantenha os dados sempre sincronizados com o time de campo.
        </p>
        <button
          type="button"
          onClick={openCreateDialog}
          className="inline-flex items-center justify-center rounded-full bg-[#4338CA] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3730A3]"
        >
          + Adicionar motorista
        </button>
      </div>

      {error && hasLoadedDrivers && (
        <div className="rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="driver-search">
            Buscar motorista
          </label>
          <input
            id="driver-search"
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Busque por nome, CPF, celular ou CNH"
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
          <label htmlFor="page-size" className="text-sm font-medium text-[#4B5563]">
            Linhas por página
          </label>
          <select
            id="page-size"
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
                  CNH
                </th>
                <th scope="col" className="px-6 py-4">
                  Celular
                </th>
                <th scope="col" className="px-6 py-4">
                  Email
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] text-[#111827]">
              {paginatedDrivers.length > 0 ? (
                paginatedDrivers.map((driver) => (
                  <tr key={driver.cpf} className="hover:bg-[#F9FAFB]">
                    <td className="px-6 py-4 font-mono text-xs text-[#4B5563]">
                      {driver.cpf}
                    </td>
                    <td className="px-6 py-4 font-medium">{driver.name}</td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {driver.cnh ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {driver.phone ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {driver.email ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDialog(driver)}
                          className="rounded-full border border-[#4338CA] px-3 py-1 text-xs font-semibold text-[#4338CA] transition hover:bg-[#EEF2FF]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(driver)}
                          disabled={processingDeleteCpf === driver.cpf}
                          className="rounded-full border border-[#F87171] px-3 py-1 text-xs font-semibold text-[#B91C1C] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {processingDeleteCpf === driver.cpf ? "Excluindo..." : "Excluir"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#6B7280]">
                    {tableEmptyState()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#E5E7EB] bg-[#F9FAFB] px-6 py-4 text-sm text-[#4B5563] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Exibindo {paginatedDrivers.length} de {filteredDrivers.length} motorista(s)
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
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0F1730]">
                {dialogMode === "create" ? "Adicionar motorista" : "Editar motorista"}
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
                <div className="sm:col-span-2">
                  <label htmlFor="driver-name" className="block text-sm font-medium text-[#374151]">
                    Nome completo
                  </label>
                  <input
                    id="driver-name"
                    name="name"
                    value={formState.name}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="Digite o nome do motorista"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="driver-cpf" className="block text-sm font-medium text-[#374151]">
                    CPF
                  </label>
                  <input
                    id="driver-cpf"
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
                  <label htmlFor="driver-cnh" className="block text-sm font-medium text-[#374151]">
                    CNH
                  </label>
                  <input
                    id="driver-cnh"
                    name="cnh"
                    value={formState.cnh}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="Número da CNH"
                  />
                </div>
                <div>
                  <label htmlFor="driver-phone" className="block text-sm font-medium text-[#374151]">
                    Celular
                  </label>
                  <input
                    id="driver-phone"
                    name="phone"
                    value={formState.phone}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label htmlFor="driver-email" className="block text-sm font-medium text-[#374151]">
                    Email
                  </label>
                  <input
                    id="driver-email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="exemplo@email.com"
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
                      ? "Cadastrar motorista"
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

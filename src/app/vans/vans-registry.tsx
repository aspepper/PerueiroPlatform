"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type VanRecord = {
  id: string;
  model: string;
  color: string | null;
  year: string | null;
  plate: string;
  driverCpf: string | null;
  driverName: string | null;
};

type VanFormState = {
  model: string;
  plate: string;
  color: string;
  year: string;
  driverCpf: string;
};

type DriverOption = {
  cpf: string;
  name: string;
};

const EMPTY_FORM_STATE: VanFormState = {
  model: "",
  plate: "",
  color: "",
  year: "",
  driverCpf: "",
};

const normalizeOptionalValue = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export default function VansRegistry() {
  const [vans, setVans] = useState<VanRecord[]>([]);
  const [hasLoadedVans, setHasLoadedVans] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [formState, setFormState] = useState<VanFormState>(EMPTY_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [processingDeleteId, setProcessingDeleteId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadVans = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/vans", {
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? "Não foi possível carregar as vans.");
        }

        const payload = await response.json();
        const fetchedVans: VanRecord[] = (payload?.vans ?? []).map(
          (van: VanRecord) => ({
            id: van.id,
            model: van.model,
            color: van.color ?? null,
            year: van.year ?? null,
            plate: van.plate,
            driverCpf: van.driverCpf ?? null,
            driverName: van.driverName ?? null,
          }),
        );

        setVans(fetchedVans);
        setHasLoadedVans(true);
      } catch (loadError) {
        if ((loadError as Error).name === "AbortError") return;
        setError((loadError as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadVans();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadDrivers = async () => {
      try {
        setIsLoadingDrivers(true);
        const response = await fetch("/api/drivers", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error();
        }

        const payload = await response.json();
        const fetchedDrivers: DriverOption[] = (payload?.drivers ?? []).map(
          (driver: { cpf: string; name: string }) => ({
            cpf: driver.cpf,
            name: driver.name,
          }),
        );

        setDrivers(fetchedDrivers);
      } catch (loadError) {
        console.error("Falha ao carregar motoristas:", loadError);
      } finally {
        setIsLoadingDrivers(false);
      }
    };

    void loadDrivers();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredVans = useMemo(() => {
    const normalizedQuery = appliedFilter.trim().toLowerCase();

    const results = vans.filter((van) => {
      if (!normalizedQuery) return true;

      return [
        van.model,
        van.plate,
        van.color ?? "",
        van.year ?? "",
        van.driverName ?? "",
        van.driverCpf ?? "",
      ]
        .map((value) => value.toLowerCase())
        .some((value) => value.includes(normalizedQuery));
    });

    return [...results].sort((a, b) =>
      a.model.localeCompare(b.model, "pt-BR", { sensitivity: "base" }),
    );
  }, [appliedFilter, vans]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilter, pageSize, filteredVans.length]);

  const totalPages = Math.max(1, Math.ceil(filteredVans.length / pageSize));
  const paginatedVans = filteredVans.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const openCreateDialog = () => {
    setDialogMode("create");
    setFormState(EMPTY_FORM_STATE);
    setFormError(null);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (van: VanRecord) => {
    setDialogMode("edit");
    setFormState({
      model: van.model,
      plate: van.plate,
      color: van.color ?? "",
      year: van.year ?? "",
      driverCpf: van.driverCpf ?? "",
    });
    setFormError(null);
    setEditingId(van.id);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    if (isSubmitting) return;
    setIsDialogOpen(false);
    setFormState(EMPTY_FORM_STATE);
    setEditingId(null);
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

    const trimmedModel = formState.model.trim();
    const trimmedPlate = formState.plate.trim();

    if (!trimmedModel || !trimmedPlate) {
      setFormError("Modelo e placa são obrigatórios.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      setError(null);

      const payload = {
        model: trimmedModel,
        plate: trimmedPlate,
        color: normalizeOptionalValue(formState.color),
        year: normalizeOptionalValue(formState.year),
        driverCpf: normalizeOptionalValue(formState.driverCpf),
      };

      const response = await fetch(
        dialogMode === "create"
          ? "/api/vans"
          : `/api/vans/${encodeURIComponent(editingId ?? "")}`,
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
              ? "Não foi possível cadastrar a van."
              : "Não foi possível atualizar a van."),
        );
      }

      const updatedVan: VanRecord = {
        id: responseBody.van.id,
        model: responseBody.van.model,
        color: responseBody.van.color ?? null,
        year: responseBody.van.year ?? null,
        plate: responseBody.van.plate,
        driverCpf: responseBody.van.driverCpf ?? null,
        driverName: responseBody.van.driverName ?? null,
      };

      setVans((previous) => {
        if (dialogMode === "create") {
          return [...previous, updatedVan];
        }

        return previous.map((van) =>
          van.id === updatedVan.id ? updatedVan : van,
        );
      });
      setHasLoadedVans(true);
      setIsDialogOpen(false);
      setFormState(EMPTY_FORM_STATE);
      setEditingId(null);
    } catch (submitError) {
      setFormError((submitError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (van: VanRecord) => {
    const confirmed = window.confirm(
      `Tem certeza de que deseja remover a van placa ${van.plate}? Essa ação não pode ser desfeita.`,
    );

    if (!confirmed) return;

    try {
      setProcessingDeleteId(van.id);
      setError(null);

      const response = await fetch(
        `/api/vans/${encodeURIComponent(van.id)}`,
        { method: "DELETE" },
      );

      const responseBody = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          responseBody.error ?? "Não foi possível remover a van.",
        );
      }

      setVans((previous) =>
        previous.filter((existing) => existing.id !== van.id),
      );
      setHasLoadedVans(true);
    } catch (deleteError) {
      setError((deleteError as Error).message);
    } finally {
      setProcessingDeleteId(null);
    }
  };

  const tableEmptyState = () => {
    if (isLoading) {
      return "Carregando vans...";
    }

    if (error && !hasLoadedVans) {
      return error;
    }

    if (hasLoadedVans && vans.length === 0) {
      return "Nenhum veículo cadastrado";
    }

    return "Nenhuma van encontrada. Ajuste a busca ou limpe os filtros para ver todos os registros.";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#4B5563]">
          Registre inspeções, lotação e documentação veicular para garantir que cada van esteja pronta para operar com segurança.
        </p>
        <button
          type="button"
          onClick={openCreateDialog}
          className="inline-flex items-center justify-center rounded-full bg-[#4338CA] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3730A3]"
        >
          + Adicionar van
        </button>
      </div>

      {error && hasLoadedVans && (
        <div className="rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="van-search">
            Buscar van
          </label>
          <input
            id="van-search"
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Busque por modelo, placa ou motorista"
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
          <label htmlFor="vans-page-size" className="text-sm font-medium text-[#4B5563]">
            Linhas por página
          </label>
          <select
            id="vans-page-size"
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
                  Placa
                </th>
                <th scope="col" className="px-6 py-4">
                  Modelo
                </th>
                <th scope="col" className="px-6 py-4">
                  Cor
                </th>
                <th scope="col" className="px-6 py-4">
                  Ano
                </th>
                <th scope="col" className="px-6 py-4">
                  Motorista vinculado
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] text-[#111827]">
              {paginatedVans.length > 0 ? (
                paginatedVans.map((van) => (
                  <tr key={van.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-6 py-4 font-mono text-xs text-[#4B5563]">
                      {van.plate}
                    </td>
                    <td className="px-6 py-4 font-medium">{van.model}</td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {van.color ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {van.year ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {van.driverName ?? van.driverCpf ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDialog(van)}
                          className="rounded-full border border-[#4338CA] px-3 py-1 text-xs font-semibold text-[#4338CA] transition hover:bg-[#EEF2FF]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(van)}
                          disabled={processingDeleteId === van.id}
                          className="rounded-full border border-[#F87171] px-3 py-1 text-xs font-semibold text-[#B91C1C] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {processingDeleteId === van.id ? "Excluindo..." : "Excluir"}
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
            Exibindo {paginatedVans.length} de {filteredVans.length} van(s)
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
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0F1730]">
                {dialogMode === "create" ? "Adicionar van" : "Editar van"}
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
                  <label htmlFor="van-model" className="block text-sm font-medium text-[#374151]">
                    Modelo
                  </label>
                  <input
                    id="van-model"
                    name="model"
                    value={formState.model}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="Ex.: Sprinter Executiva"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="van-plate" className="block text-sm font-medium text-[#374151]">
                    Placa
                  </label>
                  <input
                    id="van-plate"
                    name="plate"
                    value={formState.plate}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="ABC-1D23"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="van-color" className="block text-sm font-medium text-[#374151]">
                    Cor
                  </label>
                  <input
                    id="van-color"
                    name="color"
                    value={formState.color}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="Cor predominante"
                  />
                </div>
                <div>
                  <label htmlFor="van-year" className="block text-sm font-medium text-[#374151]">
                    Ano
                  </label>
                  <input
                    id="van-year"
                    name="year"
                    value={formState.year}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="2024"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="van-driver" className="block text-sm font-medium text-[#374151]">
                    Motorista responsável
                  </label>
                  <select
                    id="van-driver"
                    name="driverCpf"
                    value={formState.driverCpf}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    disabled={isLoadingDrivers}
                  >
                    <option value="">Sem motorista vinculado</option>
                    {drivers.map((driver) => (
                      <option key={driver.cpf} value={driver.cpf}>
                        {driver.name} • {driver.cpf}
                      </option>
                    ))}
                  </select>
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
                      ? "Cadastrar van"
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

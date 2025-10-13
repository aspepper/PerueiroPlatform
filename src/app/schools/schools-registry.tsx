"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type SchoolRecord = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  contact: string | null;
  principal: string | null;
  doorman: string | null;
};

type SchoolFormState = {
  name: string;
  address: string;
  phone: string;
  contact: string;
  principal: string;
  doorman: string;
};

const EMPTY_FORM_STATE: SchoolFormState = {
  name: "",
  address: "",
  phone: "",
  contact: "",
  principal: "",
  doorman: "",
};

const normalizeOptionalValue = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export default function SchoolsRegistry() {
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [hasLoadedSchools, setHasLoadedSchools] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [formState, setFormState] = useState<SchoolFormState>(EMPTY_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [processingDeleteId, setProcessingDeleteId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadSchools = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/schools", {
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(
            payload.error ?? "Não foi possível carregar as escolas.",
          );
        }

        const payload = await response.json();
        const fetchedSchools: SchoolRecord[] = (payload?.schools ?? []).map(
          (school: SchoolRecord) => ({
            id: school.id,
            name: school.name,
            address: school.address,
            phone: school.phone ?? null,
            contact: school.contact ?? null,
            principal: school.principal ?? null,
            doorman: school.doorman ?? null,
          }),
        );

        setSchools(fetchedSchools);
        setHasLoadedSchools(true);
      } catch (loadError) {
        if ((loadError as Error).name === "AbortError") return;
        setError((loadError as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSchools();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredSchools = useMemo(() => {
    const normalizedQuery = appliedFilter.trim().toLowerCase();

    const results = schools.filter((school) => {
      if (!normalizedQuery) return true;

      return [
        school.name,
        school.address,
        school.phone ?? "",
        school.contact ?? "",
        school.principal ?? "",
        school.doorman ?? "",
      ]
        .map((value) => value.toLowerCase())
        .some((value) => value.includes(normalizedQuery));
    });

    return [...results].sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }),
    );
  }, [appliedFilter, schools]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilter, pageSize, filteredSchools.length]);

  const totalPages = Math.max(1, Math.ceil(filteredSchools.length / pageSize));
  const paginatedSchools = filteredSchools.slice(
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

  const openEditDialog = (school: SchoolRecord) => {
    setDialogMode("edit");
    setFormState({
      name: school.name,
      address: school.address,
      phone: school.phone ?? "",
      contact: school.contact ?? "",
      principal: school.principal ?? "",
      doorman: school.doorman ?? "",
    });
    setFormError(null);
    setEditingId(school.id);
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
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormState((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = formState.name.trim();
    const trimmedAddress = formState.address.trim();

    if (!trimmedName || !trimmedAddress) {
      setFormError("Nome e endereço são obrigatórios.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      setError(null);

      const payload = {
        name: trimmedName,
        address: trimmedAddress,
        phone: normalizeOptionalValue(formState.phone),
        contact: normalizeOptionalValue(formState.contact),
        principal: normalizeOptionalValue(formState.principal),
        doorman: normalizeOptionalValue(formState.doorman),
      };

      const response = await fetch(
        dialogMode === "create"
          ? "/api/schools"
          : `/api/schools/${encodeURIComponent(editingId ?? "")}`,
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
              ? "Não foi possível cadastrar a escola."
              : "Não foi possível atualizar a escola."),
        );
      }

      const updatedSchool: SchoolRecord = {
        id: responseBody.school.id,
        name: responseBody.school.name,
        address: responseBody.school.address,
        phone: responseBody.school.phone ?? null,
        contact: responseBody.school.contact ?? null,
        principal: responseBody.school.principal ?? null,
        doorman: responseBody.school.doorman ?? null,
      };

      setSchools((previous) => {
        if (dialogMode === "create") {
          return [...previous, updatedSchool];
        }

        return previous.map((school) =>
          school.id === updatedSchool.id ? updatedSchool : school,
        );
      });
      setHasLoadedSchools(true);
      setIsDialogOpen(false);
      setFormState(EMPTY_FORM_STATE);
      setEditingId(null);
    } catch (submitError) {
      setFormError((submitError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (school: SchoolRecord) => {
    const confirmed = window.confirm(
      `Tem certeza de que deseja remover a escola ${school.name}? Essa ação não pode ser desfeita.`,
    );

    if (!confirmed) return;

    try {
      setProcessingDeleteId(school.id);
      setError(null);

      const response = await fetch(
        `/api/schools/${encodeURIComponent(school.id)}`,
        { method: "DELETE" },
      );

      const responseBody = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          responseBody.error ?? "Não foi possível remover a escola.",
        );
      }

      setSchools((previous) =>
        previous.filter((existing) => existing.id !== school.id),
      );
      setHasLoadedSchools(true);
    } catch (deleteError) {
      setError((deleteError as Error).message);
    } finally {
      setProcessingDeleteId(null);
    }
  };

  const tableEmptyState = () => {
    if (isLoading) {
      return "Carregando escolas...";
    }

    if (error && !hasLoadedSchools) {
      return error;
    }

    if (hasLoadedSchools && schools.length === 0) {
      return "Nenhuma escola cadastrada";
    }

    return "Nenhuma escola encontrada. Ajuste a busca ou limpe os filtros para ver todos os registros.";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#4B5563]">
          Cadastre instituições de ensino, mantenha dados de contato atualizados e associe unidades às rotas operacionais.
        </p>
        <button
          type="button"
          onClick={openCreateDialog}
          className="inline-flex items-center justify-center rounded-full bg-[#4338CA] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3730A3]"
        >
          + Adicionar escola
        </button>
      </div>

      {error && hasLoadedSchools && (
        <div className="rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="school-search">
            Buscar escola
          </label>
          <input
            id="school-search"
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Busque por nome, endereço ou contato"
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
          <label htmlFor="schools-page-size" className="text-sm font-medium text-[#4B5563]">
            Linhas por página
          </label>
          <select
            id="schools-page-size"
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
                  Nome
                </th>
                <th scope="col" className="px-6 py-4">
                  Endereço
                </th>
                <th scope="col" className="px-6 py-4">
                  Telefone
                </th>
                <th scope="col" className="px-6 py-4">
                  Contato principal
                </th>
                <th scope="col" className="px-6 py-4">
                  Equipe
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] text-[#111827]">
              {paginatedSchools.length > 0 ? (
                paginatedSchools.map((school) => (
                  <tr key={school.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-6 py-4 font-medium">{school.name}</td>
                    <td className="px-6 py-4 text-[#4B5563]">{school.address}</td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {school.phone ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {school.contact ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {[school.principal, school.doorman]
                        .filter((value) => value)
                        .join(" • ") || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDialog(school)}
                          className="rounded-full border border-[#4338CA] px-3 py-1 text-xs font-semibold text-[#4338CA] transition hover:bg-[#EEF2FF]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(school)}
                          disabled={processingDeleteId === school.id}
                          className="rounded-full border border-[#F87171] px-3 py-1 text-xs font-semibold text-[#B91C1C] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {processingDeleteId === school.id
                            ? "Excluindo..."
                            : "Excluir"}
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
            Exibindo {paginatedSchools.length} de {filteredSchools.length} escola(s)
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
                {dialogMode === "create" ? "Adicionar escola" : "Editar escola"}
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
                  <label htmlFor="school-name" className="block text-sm font-medium text-[#374151]">
                    Nome da escola
                  </label>
                  <input
                    id="school-name"
                    name="name"
                    value={formState.name}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="Digite o nome da instituição"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="school-address" className="block text-sm font-medium text-[#374151]">
                    Endereço completo
                  </label>
                  <textarea
                    id="school-address"
                    name="address"
                    value={formState.address}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="Rua, número, bairro, cidade"
                    rows={2}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="school-phone" className="block text-sm font-medium text-[#374151]">
                    Telefone
                  </label>
                  <input
                    id="school-phone"
                    name="phone"
                    value={formState.phone}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="(00) 0000-0000"
                  />
                </div>
                <div>
                  <label htmlFor="school-contact" className="block text-sm font-medium text-[#374151]">
                    Contato principal
                  </label>
                  <input
                    id="school-contact"
                    name="contact"
                    value={formState.contact}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="Nome e telefone do contato"
                  />
                </div>
                <div>
                  <label htmlFor="school-principal" className="block text-sm font-medium text-[#374151]">
                    Diretor(a)
                  </label>
                  <input
                    id="school-principal"
                    name="principal"
                    value={formState.principal}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="Nome do diretor"
                  />
                </div>
                <div>
                  <label htmlFor="school-doorman" className="block text-sm font-medium text-[#374151]">
                    Porteiro / Recepção
                  </label>
                  <input
                    id="school-doorman"
                    name="doorman"
                    value={formState.doorman}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="Nome do responsável pela recepção"
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
                      ? "Cadastrar escola"
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

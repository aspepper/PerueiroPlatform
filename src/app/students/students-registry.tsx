"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type StudentRecord = {
  id: string;
  name: string;
  birthDate: string | null;
  grade: string | null;
  guardianCpf: string | null;
  guardianName: string | null;
  schoolId: string | null;
  schoolName: string | null;
  vanId: string | null;
  vanLabel: string | null;
  driverCpf: string | null;
  driverName: string | null;
  mobile: string | null;
  blacklist: boolean;
};

type StudentFormState = {
  name: string;
  birthDate: string;
  grade: string;
  guardianCpf: string;
  schoolId: string;
  vanId: string;
  driverCpf: string;
  mobile: string;
  blacklist: boolean;
};

type ClientOption = {
  cpf: string;
  name: string;
};

type SchoolOption = {
  id: string;
  name: string;
};

type VanOption = {
  id: string;
  label: string;
};

type DriverOption = {
  cpf: string;
  name: string;
};

const EMPTY_FORM_STATE: StudentFormState = {
  name: "",
  birthDate: "",
  grade: "",
  guardianCpf: "",
  schoolId: "",
  vanId: "",
  driverCpf: "",
  mobile: "",
  blacklist: false,
};

const normalizeOptionalValue = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const formatDateForInput = (value: string | null) => {
  if (!value) return "";
  return value.slice(0, 10);
};

const formatDateForDisplay = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(date);
};

export default function StudentsRegistry() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [hasLoadedStudents, setHasLoadedStudents] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [vans, setVans] = useState<VanOption[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [isLoadingRelations, setIsLoadingRelations] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [formState, setFormState] = useState<StudentFormState>(EMPTY_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [processingDeleteId, setProcessingDeleteId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadStudents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/students", {
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(
            payload.error ?? "Não foi possível carregar os alunos.",
          );
        }

        const payload = await response.json();
        const fetchedStudents: StudentRecord[] = (payload?.students ?? []).map(
          (student: StudentRecord) => ({
            id: student.id,
            name: student.name,
            birthDate: student.birthDate ?? null,
            grade: student.grade ?? null,
            guardianCpf: student.guardianCpf ?? null,
            guardianName: student.guardianName ?? null,
            schoolId: student.schoolId ?? null,
            schoolName: student.schoolName ?? null,
            vanId: student.vanId ?? null,
            vanLabel: student.vanLabel ?? null,
            driverCpf: student.driverCpf ?? null,
            driverName: student.driverName ?? null,
            mobile: student.mobile ?? null,
            blacklist: Boolean(student.blacklist),
          }),
        );

        setStudents(fetchedStudents);
        setHasLoadedStudents(true);
      } catch (loadError) {
        if ((loadError as Error).name === "AbortError") return;
        setError((loadError as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadStudents();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadRelations = async () => {
      try {
        setIsLoadingRelations(true);

        const [clientsResponse, schoolsResponse, vansResponse, driversResponse] =
          await Promise.all([
            fetch("/api/clients", { signal: controller.signal }),
            fetch("/api/schools", { signal: controller.signal }),
            fetch("/api/vans", { signal: controller.signal }),
            fetch("/api/drivers", { signal: controller.signal }),
          ]);

        if (clientsResponse.ok) {
          const payload = await clientsResponse.json();
          const fetchedClients: ClientOption[] = (payload?.clients ?? []).map(
            (client: { cpf: string; name: string }) => ({
              cpf: client.cpf,
              name: client.name,
            }),
          );
          setClients(fetchedClients);
        }

        if (schoolsResponse.ok) {
          const payload = await schoolsResponse.json();
          const fetchedSchools: SchoolOption[] = (payload?.schools ?? []).map(
            (school: { id: string; name: string }) => ({
              id: school.id,
              name: school.name,
            }),
          );
          setSchools(fetchedSchools);
        }

        if (vansResponse.ok) {
          const payload = await vansResponse.json();
          const fetchedVans: VanOption[] = (payload?.vans ?? []).map(
            (van: { id: string; model: string; plate: string }) => ({
              id: van.id,
              label: `${van.model} • ${van.plate}`,
            }),
          );
          setVans(fetchedVans);
        }

        if (driversResponse.ok) {
          const payload = await driversResponse.json();
          const fetchedDrivers: DriverOption[] = (payload?.drivers ?? []).map(
            (driver: { cpf: string; name: string }) => ({
              cpf: driver.cpf,
              name: driver.name,
            }),
          );
          setDrivers(fetchedDrivers);
        }
      } catch (loadError) {
        console.error("Falha ao carregar dados auxiliares", loadError);
      } finally {
        setIsLoadingRelations(false);
      }
    };

    void loadRelations();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = appliedFilter.trim().toLowerCase();

    const results = students.filter((student) => {
      if (!normalizedQuery) return true;

      return [
        student.name,
        student.guardianName ?? "",
        student.guardianCpf ?? "",
        student.schoolName ?? "",
        student.vanLabel ?? "",
        student.driverName ?? "",
        student.driverCpf ?? "",
        student.grade ?? "",
        student.mobile ?? "",
      ]
        .map((value) => value.toLowerCase())
        .some((value) => value.includes(normalizedQuery));
    });

    return [...results].sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }),
    );
  }, [appliedFilter, students]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilter, pageSize, filteredStudents.length]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = filteredStudents.slice(
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

  const openEditDialog = (student: StudentRecord) => {
    setDialogMode("edit");
    setFormState({
      name: student.name,
      birthDate: formatDateForInput(student.birthDate),
      grade: student.grade ?? "",
      guardianCpf: student.guardianCpf ?? "",
      schoolId: student.schoolId ?? "",
      vanId: student.vanId ?? "",
      driverCpf: student.driverCpf ?? "",
      mobile: student.mobile ?? "",
      blacklist: Boolean(student.blacklist),
    });
    setFormError(null);
    setEditingId(student.id);
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

  const handleBlacklistChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setFormState((previous) => ({ ...previous, blacklist: checked }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = formState.name.trim();

    if (!trimmedName) {
      setFormError("O nome do aluno é obrigatório.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      setError(null);

      const payload = {
        name: trimmedName,
        birthDate: formState.birthDate ? formState.birthDate : null,
        grade: normalizeOptionalValue(formState.grade),
        guardianCpf: normalizeOptionalValue(formState.guardianCpf),
        schoolId: formState.schoolId.trim() ? formState.schoolId.trim() : null,
        vanId: formState.vanId.trim() ? formState.vanId.trim() : null,
        driverCpf: normalizeOptionalValue(formState.driverCpf),
        mobile: normalizeOptionalValue(formState.mobile),
        blacklist: formState.blacklist,
      };

      const response = await fetch(
        dialogMode === "create"
          ? "/api/students"
          : `/api/students/${encodeURIComponent(editingId ?? "")}`,
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
              ? "Não foi possível cadastrar o aluno."
              : "Não foi possível atualizar o aluno."),
        );
      }

      const updatedStudent: StudentRecord = {
        id: responseBody.student.id,
        name: responseBody.student.name,
        birthDate: responseBody.student.birthDate ?? null,
        grade: responseBody.student.grade ?? null,
        guardianCpf: responseBody.student.guardianCpf ?? null,
        guardianName: responseBody.student.guardianName ?? null,
        schoolId: responseBody.student.schoolId ?? null,
        schoolName: responseBody.student.schoolName ?? null,
        vanId: responseBody.student.vanId ?? null,
        vanLabel: responseBody.student.vanLabel ?? null,
        driverCpf: responseBody.student.driverCpf ?? null,
        driverName: responseBody.student.driverName ?? null,
        mobile: responseBody.student.mobile ?? null,
        blacklist: Boolean(responseBody.student.blacklist),
      };

      setStudents((previous) => {
        if (dialogMode === "create") {
          return [...previous, updatedStudent];
        }

        return previous.map((student) =>
          student.id === updatedStudent.id ? updatedStudent : student,
        );
      });
      setHasLoadedStudents(true);
      setIsDialogOpen(false);
      setFormState(EMPTY_FORM_STATE);
      setEditingId(null);
    } catch (submitError) {
      setFormError((submitError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (student: StudentRecord) => {
    const confirmed = window.confirm(
      `Tem certeza de que deseja remover o aluno ${student.name}? Essa ação não pode ser desfeita.`,
    );

    if (!confirmed) return;

    try {
      setProcessingDeleteId(student.id);
      setError(null);

      const response = await fetch(
        `/api/students/${encodeURIComponent(student.id)}`,
        { method: "DELETE" },
      );

      const responseBody = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          responseBody.error ?? "Não foi possível remover o aluno.",
        );
      }

      setStudents((previous) =>
        previous.filter((existing) => existing.id !== student.id),
      );
      setHasLoadedStudents(true);
    } catch (deleteError) {
      setError((deleteError as Error).message);
    } finally {
      setProcessingDeleteId(null);
    }
  };

  const tableEmptyState = () => {
    if (isLoading) {
      return "Carregando alunos...";
    }

    if (error && !hasLoadedStudents) {
      return error;
    }

    if (hasLoadedStudents && students.length === 0) {
      return "Nenhum aluno cadastrado";
    }

    return "Nenhum aluno encontrado. Ajuste a busca ou limpe os filtros para ver todos os registros.";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#4B5563]">
          Monitore dados acadêmicos, responsáveis e rotas associadas para cada estudante atendido pela operação.
        </p>
        <button
          type="button"
          onClick={openCreateDialog}
          className="inline-flex items-center justify-center rounded-full bg-[#4338CA] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3730A3]"
        >
          + Adicionar aluno
        </button>
      </div>

      {error && hasLoadedStudents && (
        <div className="rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="student-search">
            Buscar aluno
          </label>
          <input
            id="student-search"
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Busque por nome, responsável, escola ou veículo"
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
          <label htmlFor="students-page-size" className="text-sm font-medium text-[#4B5563]">
            Linhas por página
          </label>
          <select
            id="students-page-size"
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
                  Aluno
                </th>
                <th scope="col" className="px-6 py-4">
                  Responsável
                </th>
                <th scope="col" className="px-6 py-4">
                  Escola
                </th>
                <th scope="col" className="px-6 py-4">
                  Veículo
                </th>
                <th scope="col" className="px-6 py-4">
                  Motorista
                </th>
                <th scope="col" className="px-6 py-4">
                  Contato
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  Situação
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] text-[#111827]">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-6 py-4">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-xs text-[#4B5563]">
                        {student.grade ? `Série: ${student.grade}` : ""}
                        {student.birthDate
                          ? `${student.grade ? " • " : ""}Nasc.: ${formatDateForDisplay(student.birthDate)}`
                          : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {student.guardianName ?? student.guardianCpf ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {student.schoolName ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {student.vanLabel ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {student.driverName ?? student.driverCpf ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {student.mobile ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold">
                      <span
                        className={
                          student.blacklist
                            ? "rounded-full bg-[#FEE2E2] px-3 py-1 text-[#B91C1C]"
                            : "rounded-full bg-[#E0F2FE] px-3 py-1 text-[#0369A1]"
                        }
                      >
                        {student.blacklist ? "Na lista negra" : "Regular"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDialog(student)}
                          className="rounded-full border border-[#4338CA] px-3 py-1 text-xs font-semibold text-[#4338CA] transition hover:bg-[#EEF2FF]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(student)}
                          disabled={processingDeleteId === student.id}
                          className="rounded-full border border-[#F87171] px-3 py-1 text-xs font-semibold text-[#B91C1C] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {processingDeleteId === student.id
                            ? "Excluindo..."
                            : "Excluir"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-[#6B7280]">
                    {tableEmptyState()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#E5E7EB] bg-[#F9FAFB] px-6 py-4 text-sm text-[#4B5563] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Exibindo {paginatedStudents.length} de {filteredStudents.length} aluno(s)
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
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0F1730]">
                {dialogMode === "create" ? "Adicionar aluno" : "Editar aluno"}
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
                  <label htmlFor="student-name" className="block text-sm font-medium text-[#374151]">
                    Nome do aluno
                  </label>
                  <input
                    id="student-name"
                    name="name"
                    value={formState.name}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="student-grade" className="block text-sm font-medium text-[#374151]">
                    Série / Turma
                  </label>
                  <input
                    id="student-grade"
                    name="grade"
                    value={formState.grade}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="Ex.: 5º ano B"
                  />
                </div>
                <div>
                  <label htmlFor="student-birthDate" className="block text-sm font-medium text-[#374151]">
                    Data de nascimento
                  </label>
                  <input
                    id="student-birthDate"
                    name="birthDate"
                    type="date"
                    value={formState.birthDate}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                  />
                </div>
                <div>
                  <label htmlFor="student-mobile" className="block text-sm font-medium text-[#374151]">
                    Telefone do aluno ou responsável
                  </label>
                  <input
                    id="student-mobile"
                    name="mobile"
                    value={formState.mobile}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label htmlFor="student-guardian" className="block text-sm font-medium text-[#374151]">
                    Responsável
                  </label>
                  <select
                    id="student-guardian"
                    name="guardianCpf"
                    value={formState.guardianCpf}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    disabled={isLoadingRelations}
                  >
                    <option value="">Selecione um responsável</option>
                    {clients.map((client) => (
                      <option key={client.cpf} value={client.cpf}>
                        {client.name} • {client.cpf}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="student-school" className="block text-sm font-medium text-[#374151]">
                    Escola
                  </label>
                  <select
                    id="student-school"
                    name="schoolId"
                    value={formState.schoolId}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    disabled={isLoadingRelations}
                  >
                    <option value="">Sem escola vinculada</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="student-van" className="block text-sm font-medium text-[#374151]">
                    Veículo
                  </label>
                  <select
                    id="student-van"
                    name="vanId"
                    value={formState.vanId}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    disabled={isLoadingRelations}
                  >
                    <option value="">Sem veículo vinculado</option>
                    {vans.map((van) => (
                      <option key={van.id} value={van.id}>
                        {van.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="student-driver" className="block text-sm font-medium text-[#374151]">
                    Motorista
                  </label>
                  <select
                    id="student-driver"
                    name="driverCpf"
                    value={formState.driverCpf}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-[#CBD5F5] bg-[#F8FAFF] px-4 py-2 text-sm text-[#1F2937] outline-none transition focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20"
                    disabled={isLoadingRelations}
                  >
                    <option value="">Sem motorista vinculado</option>
                    {drivers.map((driver) => (
                      <option key={driver.cpf} value={driver.cpf}>
                        {driver.name} • {driver.cpf}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-[#374151]">
                    <input
                      type="checkbox"
                      name="blacklist"
                      checked={formState.blacklist}
                      onChange={handleBlacklistChange}
                      className="h-4 w-4 rounded border-[#CBD5F5] text-[#4338CA] focus:ring-[#4338CA]"
                    />
                    Inserir aluno na lista negra
                  </label>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    Utilize esta opção para sinalizar restrições de embarque ou histórico de ocorrências críticas.
                  </p>
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
                      ? "Cadastrar aluno"
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

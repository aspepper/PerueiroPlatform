"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type DriverRecord = {
  id: string;
  name: string;
  cpf: string;
  cnh: string;
  phone: string;
  email: string;
};

const DRIVER_REGISTRY: DriverRecord[] = [
  {
    id: "1",
    name: "Adriana Costa",
    cpf: "123.456.789-01",
    cnh: "98765432100",
    phone: "(11) 91234-5678",
    email: "adriana.costa@example.com",
  },
  {
    id: "2",
    name: "Bruno Almeida",
    cpf: "234.567.890-12",
    cnh: "87654321099",
    phone: "(11) 99876-5432",
    email: "bruno.almeida@example.com",
  },
  {
    id: "3",
    name: "Carla Menezes",
    cpf: "345.678.901-23",
    cnh: "76543210988",
    phone: "(21) 98765-4321",
    email: "carla.menezes@example.com",
  },
  {
    id: "4",
    name: "Daniel Souza",
    cpf: "456.789.012-34",
    cnh: "65432109877",
    phone: "(31) 93456-7890",
    email: "daniel.souza@example.com",
  },
  {
    id: "5",
    name: "Eduarda Martins",
    cpf: "567.890.123-45",
    cnh: "54321098766",
    phone: "(41) 90012-3456",
    email: "eduarda.martins@example.com",
  },
  {
    id: "6",
    name: "Felipe Tavares",
    cpf: "678.901.234-56",
    cnh: "43210987655",
    phone: "(31) 98888-7777",
    email: "felipe.tavares@example.com",
  },
  {
    id: "7",
    name: "Gabriela Rocha",
    cpf: "789.012.345-67",
    cnh: "32109876544",
    phone: "(21) 95555-1234",
    email: "gabriela.rocha@example.com",
  },
  {
    id: "8",
    name: "Heitor Fernandes",
    cpf: "890.123.456-78",
    cnh: "21098765433",
    phone: "(51) 97777-8888",
    email: "heitor.fernandes@example.com",
  },
  {
    id: "9",
    name: "Isabela Lima",
    cpf: "901.234.567-89",
    cnh: "10987654322",
    phone: "(11) 96666-5555",
    email: "isabela.lima@example.com",
  },
  {
    id: "10",
    name: "João Pedro",
    cpf: "012.345.678-90",
    cnh: "99887766550",
    phone: "(71) 98899-7766",
    email: "joao.pedro@example.com",
  },
  {
    id: "11",
    name: "Karen Oliveira",
    cpf: "101.112.131-41",
    cnh: "88776655449",
    phone: "(19) 99777-3344",
    email: "karen.oliveira@example.com",
  },
  {
    id: "12",
    name: "Lucas Ribeiro",
    cpf: "202.223.242-52",
    cnh: "77665544338",
    phone: "(85) 98888-2211",
    email: "lucas.ribeiro@example.com",
  },
  {
    id: "13",
    name: "Mariana Prado",
    cpf: "303.334.353-63",
    cnh: "66554433227",
    phone: "(67) 99666-8899",
    email: "mariana.prado@example.com",
  },
  {
    id: "14",
    name: "Nicolas Teixeira",
    cpf: "404.445.464-74",
    cnh: "55443322116",
    phone: "(92) 99988-7766",
    email: "nicolas.teixeira@example.com",
  },
  {
    id: "15",
    name: "Olívia Castro",
    cpf: "505.556.575-85",
    cnh: "44332211005",
    phone: "(31) 97777-6655",
    email: "olivia.castro@example.com",
  },
  {
    id: "16",
    name: "Paulo Henrique",
    cpf: "606.667.686-96",
    cnh: "33221100994",
    phone: "(51) 98800-1122",
    email: "paulo.henrique@example.com",
  },
  {
    id: "17",
    name: "Quitéria Ramos",
    cpf: "707.778.797-07",
    cnh: "22110099883",
    phone: "(11) 91122-3344",
    email: "quiteria.ramos@example.com",
  },
  {
    id: "18",
    name: "Rafael Borges",
    cpf: "808.889.808-18",
    cnh: "11009988772",
    phone: "(21) 97788-6655",
    email: "rafael.borges@example.com",
  },
  {
    id: "19",
    name: "Sabrina Leite",
    cpf: "909.990.919-29",
    cnh: "00998877661",
    phone: "(62) 98555-4433",
    email: "sabrina.leite@example.com",
  },
  {
    id: "20",
    name: "Tiago Gomes",
    cpf: "111.222.333-44",
    cnh: "11223344551",
    phone: "(18) 99877-2211",
    email: "tiago.gomes@example.com",
  },
  {
    id: "21",
    name: "Úrsula Figueiredo",
    cpf: "222.333.444-55",
    cnh: "22334455662",
    phone: "(82) 98899-6677",
    email: "ursula.figueiredo@example.com",
  },
  {
    id: "22",
    name: "Vinícius Nobre",
    cpf: "333.444.555-66",
    cnh: "33445566773",
    phone: "(84) 99911-2233",
    email: "vinicius.nobre@example.com",
  },
  {
    id: "23",
    name: "Wesley Duarte",
    cpf: "444.555.666-77",
    cnh: "44556677884",
    phone: "(21) 97700-8899",
    email: "wesley.duarte@example.com",
  },
  {
    id: "24",
    name: "Xuxa Matos",
    cpf: "555.666.777-88",
    cnh: "55667788995",
    phone: "(11) 92233-4455",
    email: "xuxa.matos@example.com",
  },
  {
    id: "25",
    name: "Yasmin Araújo",
    cpf: "666.777.888-99",
    cnh: "66778899006",
    phone: "(31) 93344-5566",
    email: "yasmin.araujo@example.com",
  },
  {
    id: "26",
    name: "Zeca Souza",
    cpf: "777.888.999-00",
    cnh: "77889900117",
    phone: "(61) 94455-6677",
    email: "zeca.souza@example.com",
  },
  {
    id: "27",
    name: "Ana Paula",
    cpf: "888.999.000-11",
    cnh: "88990011228",
    phone: "(11) 95566-7788",
    email: "ana.paula@example.com",
  },
  {
    id: "28",
    name: "Breno Vasconcelos",
    cpf: "999.000.111-22",
    cnh: "99001122339",
    phone: "(81) 96677-8899",
    email: "breno.vasconcelos@example.com",
  },
  {
    id: "29",
    name: "Clara Pacheco",
    cpf: "121.212.121-21",
    cnh: "10101010101",
    phone: "(85) 97788-9900",
    email: "clara.pacheco@example.com",
  },
  {
    id: "30",
    name: "Diego Freitas",
    cpf: "131.313.131-31",
    cnh: "20202020202",
    phone: "(91) 98877-6655",
    email: "diego.freitas@example.com",
  },
];

export default function DriversRegistry() {
  const [searchInput, setSearchInput] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredDrivers = useMemo(() => {
    const normalizedQuery = appliedFilter.trim().toLowerCase();

    const results = DRIVER_REGISTRY.filter((driver) => {
      if (!normalizedQuery) return true;

      return [driver.name, driver.cpf, driver.cnh, driver.phone, driver.email]
        .map((value) => value.toLowerCase())
        .some((value) => value.includes(normalizedQuery));
    });

    return [...results].sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }),
    );
  }, [appliedFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / pageSize));
  const paginatedDrivers = filteredDrivers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#4B5563]">
          Gerencie o cadastro dos motoristas que atuam na operação e mantenha os dados sempre sincronizados com o time de campo.
        </p>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full bg-[#4338CA] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3730A3]"
        >
          + Adicionar motorista
        </button>
      </div>

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
              {paginatedDrivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#6B7280]">
                    Nenhum motorista encontrado. Ajuste a busca ou limpe os filtros para ver todos os registros.
                  </td>
                </tr>
              ) : (
                paginatedDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-6 py-4 font-mono text-xs text-[#4B5563]">{driver.cpf}</td>
                    <td className="px-6 py-4 font-medium">{driver.name}</td>
                    <td className="px-6 py-4 text-[#4B5563]">{driver.cnh}</td>
                    <td className="px-6 py-4 text-[#4B5563]">{driver.phone}</td>
                    <td className="px-6 py-4 text-[#4B5563]">{driver.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-full border border-[#4338CA] px-3 py-1 text-xs font-semibold text-[#4338CA] transition hover:bg-[#EEF2FF]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-[#F87171] px-3 py-1 text-xs font-semibold text-[#B91C1C] transition hover:bg-[#FEF2F2]"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
    </div>
  );
}

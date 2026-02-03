import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { generateContractPdf } from "@/lib/pdf/generateContract";
import { uploadOriginalContract } from "@/lib/storage/r2";

export const dynamic = "force-dynamic";

type GenerateRequest = {
  studentId?: string;
  studentIds?: string[];
  vanId?: string;
  groupId?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
  billingDay?: number;
  rescissionFine?: number;
  forumCity?: string;
};

const parseBigInt = (value: unknown) => {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return BigInt(value);
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return BigInt(value.trim());
  }
  return null;
};

const parseBigIntString = (value: string) => {
  if (!/^\d+$/.test(value.trim())) return null;
  try {
    return BigInt(value.trim());
  } catch (error) {
    return null;
  }
};

const parseDate = (value: unknown) => {
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getStudentIds = (body: GenerateRequest) => {
  if (body.studentId) return [body.studentId];
  if (Array.isArray(body.studentIds) && body.studentIds.length > 0) return body.studentIds;
  return [];
};

const isStudentComplete = (student: {
  name: string;
  birthDate: Date | null;
  cpf: string | null;
  rg: string | null;
  period: string | null;
  vanId: bigint | null;
  driverCpf: string | null;
}) => {
  if (!student.name) return "Nome do aluno ausente.";
  if (!student.birthDate) return "Data de nascimento do aluno ausente.";
  if (!student.cpf) return "CPF do aluno ausente.";
  if (!student.rg) return "RG do aluno ausente.";
  if (!student.period) return "Período do aluno ausente.";
  if (!student.vanId) return "Van não definida para o aluno.";
  if (!student.driverCpf) return "Motorista não definido para o aluno.";
  return null;
};

const isGuardianComplete = (guardian: {
  name: string;
  cpf: string;
  rg: string | null;
  address: string | null;
  mobile: string | null;
}) => {
  if (!guardian.name) return "Nome do responsável ausente.";
  if (!guardian.cpf) return "CPF do responsável ausente.";
  if (!guardian.rg) return "RG do responsável ausente.";
  if (!guardian.address) return "Endereço do responsável ausente.";
  if (!guardian.mobile) return "Celular do responsável ausente.";
  return null;
};

const pickPrimaryGuardian = (
  guardians: Array<{ kinship: string | null; cpf: string }>,
) => {
  const order = ["pai", "mãe", "responsável legal", "avó", "avô"];
  for (const kinship of order) {
    const match = guardians.find(
      (guardian) => guardian.kinship?.trim().toLowerCase() === kinship,
    );
    if (match) return match;
  }
  return guardians[0] ?? null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequest;
    const studentIds = getStudentIds(body);
    const vanId = parseBigInt(body.vanId);
    const groupId = parseBigInt(body.groupId);
    const periodOverride = typeof body.period === "string" ? body.period.trim() : null;

    if (!studentIds.length && !vanId) {
      return NextResponse.json(
        { error: "Informe studentId(s) ou vanId para gerar contratos." },
        { status: 400 },
      );
    }

    const parsedStudentIds = studentIds
      .map((id) => parseBigIntString(id))
      .filter((id): id is bigint => id !== null);

    if (!parsedStudentIds.length && !vanId) {
      return NextResponse.json(
        { error: "Nenhum studentId válido informado." },
        { status: 400 },
      );
    }

    const students = parsedStudentIds.length
      ? await prisma.student.findMany({
          where: { id: { in: parsedStudentIds } },
          include: {
            guardians: { include: { guardian: true } },
            guardian: true,
            school: true,
            van: true,
            driver: true,
          },
        })
      : await prisma.student.findMany({
          where: { vanId: vanId ?? undefined },
          include: {
            guardians: { include: { guardian: true } },
            guardian: true,
            school: true,
            van: true,
            driver: true,
          },
        });

    if (!students.length) {
      return NextResponse.json(
        { error: "Nenhum aluno encontrado para gerar contratos." },
        { status: 404 },
      );
    }

    const group = groupId
      ? await prisma.contractGroup.findUnique({ where: { id: groupId } })
      : null;

    const startDate = parseDate(body.startDate) ?? group?.startDate ?? null;
    const endDate = parseDate(body.endDate) ?? group?.endDate ?? null;
    const billingDay =
      typeof body.billingDay === "number"
        ? body.billingDay
        : group?.billingDay ?? null;
    const rescissionFine =
      typeof body.rescissionFine === "number"
        ? body.rescissionFine
        : group?.rescissionFine ?? null;
    const forumCity =
      typeof body.forumCity === "string" && body.forumCity.trim()
        ? body.forumCity.trim()
        : group?.forumCity ?? null;

    if (!startDate || !endDate || billingDay === null || rescissionFine === null || !forumCity) {
      return NextResponse.json(
        { error: "Dados do contrato incompletos (vigência, vencimento, multa, foro)." },
        { status: 400 },
      );
    }

    const results: Array<{ studentId: string; contractId?: string; error?: string }> = [];

    for (const student of students) {
      const studentError = isStudentComplete(student);
      if (studentError) {
        results.push({ studentId: student.id.toString(), error: studentError });
        continue;
      }

      const guardiansList = student.guardians.map((link) => link.guardian);
      if (student.guardian) {
        guardiansList.push(student.guardian);
      }
      const uniqueGuardians = Array.from(
        new Map(guardiansList.map((guardian) => [guardian.cpf, guardian])).values(),
      );

      if (!uniqueGuardians.length) {
        results.push({
          studentId: student.id.toString(),
          error: "Nenhum responsável vinculado ao aluno.",
        });
        continue;
      }

      const primaryGuardian = pickPrimaryGuardian(uniqueGuardians);
      if (!primaryGuardian) {
        results.push({
          studentId: student.id.toString(),
          error: "Não foi possível selecionar um responsável principal.",
        });
        continue;
      }

      const guardianError = isGuardianComplete(primaryGuardian);
      if (guardianError) {
        results.push({ studentId: student.id.toString(), error: guardianError });
        continue;
      }

      if (!student.van) {
        results.push({
          studentId: student.id.toString(),
          error: "Van não encontrada para o aluno.",
        });
        continue;
      }

      const existingContract = await prisma.contract.findFirst({
        where: {
          studentId: student.id,
          guardianCpf: primaryGuardian.cpf,
          vanId: student.van.id,
          signed: false,
        },
      });

      if (existingContract) {
        results.push({
          studentId: student.id.toString(),
          contractId: existingContract.id.toString(),
        });
        continue;
      }

      const period = periodOverride || group?.period || student.period || "MANHA";

      const pdfBuffer = await generateContractPdf({
        student: {
          name: student.name,
          birthDate: student.birthDate,
          grade: student.grade,
          period: student.period,
        },
        guardians: uniqueGuardians.map((guardian) => ({
          name: guardian.name,
          cpf: guardian.cpf,
          rg: guardian.rg ?? null,
          kinship: guardian.kinship ?? null,
          address: guardian.address ?? null,
          mobile: guardian.mobile ?? null,
        })),
        school: student.school ? { name: student.school.name } : null,
        van: { monthlyFee: Number(student.van.monthlyFee) },
        driver: student.driver ? { name: student.driver.name } : null,
        contract: {
          startDate,
          endDate,
          billingDay,
          rescissionFine,
          forumCity,
          period,
        },
      });

      const contract = await prisma.contract.create({
        data: {
          studentId: student.id,
          guardianCpf: primaryGuardian.cpf,
          vanId: student.van.id,
          groupId: group?.id ?? null,
          period,
          startDate,
          endDate,
          billingDay,
          rescissionFine,
          forumCity,
        },
      });

      const pdfUrl = await uploadOriginalContract(pdfBuffer, contract.id.toString());

      await prisma.contract.update({
        where: { id: contract.id },
        data: { pdfUrl },
      });

      results.push({
        studentId: student.id.toString(),
        contractId: contract.id.toString(),
      });
    }

    return NextResponse.json({ results }, { status: 201 });
  } catch (error) {
    console.error("[contracts] Erro ao gerar contratos:", error);
    return NextResponse.json(
      { error: "Não foi possível gerar os contratos." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  reconcileStudentPayments,
  type StudentPaymentSnapshot,
} from "@/lib/payments-lifecycle";

const formatStudent = (student: {
  id: bigint;
  name: string;
  birthDate: Date | null;
  grade: string | null;
  guardianCpf: string | null;
  guardian: { name: string } | null;
  schoolId: bigint | null;
  school: { name: string } | null;
  vanId: bigint | null;
  van: { model: string; plate: string } | null;
  driverCpf: string | null;
  driver: { name: string } | null;
  mobile: string | null;
  blacklist: boolean;
}) => ({
  id: student.id.toString(),
  name: student.name,
  birthDate: student.birthDate?.toISOString() ?? null,
  grade: student.grade,
  guardianCpf: student.guardianCpf,
  guardianName: student.guardian?.name ?? null,
  schoolId: student.schoolId ? student.schoolId.toString() : null,
  schoolName: student.school?.name ?? null,
  vanId: student.vanId ? student.vanId.toString() : null,
  vanLabel: student.van ? `${student.van.model} • ${student.van.plate}` : null,
  driverCpf: student.driverCpf,
  driverName: student.driver?.name ?? null,
  mobile: student.mobile,
  blacklist: student.blacklist,
});

const sanitizeOptionalString = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const sanitizeOptionalDate = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const sanitizeOptionalBigInt = (value: unknown) => {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return BigInt(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (!/^\d+$/.test(trimmed)) return null;

    try {
      return BigInt(trimmed);
    } catch (error) {
      return null;
    }
  }

  return null;
};

const sanitizeBoolean = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  return false;
};

const parseIdParam = (value: string | undefined) => {
  const trimmed = (value ?? "").trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) return null;

  try {
    return BigInt(trimmed);
  } catch (error) {
    return null;
  }
};

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const studentId = parseIdParam(params.id);

    if (studentId === null) {
      return NextResponse.json(
        { error: "Identificador do aluno inválido." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "O nome do aluno é obrigatório." },
        { status: 400 },
      );
    }

    if (typeof body.id !== "undefined" && String(body.id) !== params.id) {
      return NextResponse.json(
        { error: "Não é permitido alterar o identificador do aluno." },
        { status: 400 },
      );
    }

    const previous = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, guardianCpf: true, vanId: true },
    });

    if (!previous) {
      return NextResponse.json(
        { error: "Aluno não encontrado." },
        { status: 404 },
      );
    }

    const student = await prisma.student.update({
      where: { id: studentId },
      data: {
        name,
        birthDate: sanitizeOptionalDate(body.birthDate),
        grade: sanitizeOptionalString(body.grade),
        guardianCpf: sanitizeOptionalString(body.guardianCpf),
        schoolId: sanitizeOptionalBigInt(body.schoolId),
        vanId: sanitizeOptionalBigInt(body.vanId),
        driverCpf: sanitizeOptionalString(body.driverCpf),
        mobile: sanitizeOptionalString(body.mobile),
        blacklist: sanitizeBoolean(body.blacklist),
      },
      select: {
        id: true,
        name: true,
        birthDate: true,
        grade: true,
        guardianCpf: true,
        guardian: { select: { name: true } },
        schoolId: true,
        school: { select: { name: true } },
        vanId: true,
        van: { select: { model: true, plate: true } },
        driverCpf: true,
        driver: { select: { name: true } },
        mobile: true,
        blacklist: true,
      },
    });

    const nextSnapshot: StudentPaymentSnapshot = {
      id: student.id,
      guardianCpf: student.guardianCpf,
      vanId: student.vanId,
    };

    const previousSnapshot: StudentPaymentSnapshot = {
      id: previous.id,
      guardianCpf: previous.guardianCpf,
      vanId: previous.vanId,
    };

    await reconcileStudentPayments(previousSnapshot, nextSnapshot);

    return NextResponse.json({ student: formatStudent(student) });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Aluno não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Não foi possível atualizar o aluno." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const studentId = parseIdParam(params.id);

    if (studentId === null) {
      return NextResponse.json(
        { error: "Identificador do aluno inválido." },
        { status: 400 },
      );
    }

    await prisma.student.delete({ where: { id: studentId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Aluno não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Não foi possível remover o aluno." },
      { status: 500 },
    );
  }
}

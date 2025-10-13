import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

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

const sanitizeRequiredString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

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

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { name: "asc" },
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

    return NextResponse.json({ students: students.map(formatStudent) });
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível carregar os alunos." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = sanitizeRequiredString(body.name);

    if (!name) {
      return NextResponse.json(
        { error: "O nome do aluno é obrigatório." },
        { status: 400 },
      );
    }

    const student = await prisma.student.create({
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

    return NextResponse.json({ student: formatStudent(student) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível cadastrar o aluno." },
      { status: 500 },
    );
  }
}

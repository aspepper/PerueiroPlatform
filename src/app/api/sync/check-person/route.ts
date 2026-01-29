import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { normalizeCpfOrKeep } from "@/lib/cpf";
import { requireMobileJwt, resolveSyncScope } from "../shared";

function parseDate(value: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function GET(request: Request) {
  const { unauthorized, payload } = await requireMobileJwt(request);
  if (unauthorized) return unauthorized;

  const scope = await resolveSyncScope(payload!);
  if (!scope) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const cpfInput = url.searchParams.get("cpf")?.trim() || "";
  const name = url.searchParams.get("name")?.trim() || "";
  const birthDate = parseDate(url.searchParams.get("birthDate"));

  if (!cpfInput && (!name || !birthDate)) {
    return NextResponse.json(
      { error: "CPF ou nome + data de nascimento são obrigatórios." },
      { status: 400 },
    );
  }

  if (scope.role === "DRIVER") {
    if (cpfInput) {
      const guardian = await prisma.guardian.findFirst({
        where: {
          cpf: normalizeCpfOrKeep(cpfInput),
          deletedAt: null,
          students: { some: { driverCpf: scope.cpf, deletedAt: null } },
        },
      });
      if (guardian) {
        return NextResponse.json({ type: "guardian", record: guardian });
      }
    }

    if (name && birthDate) {
      const student = await prisma.student.findFirst({
        where: {
          name,
          birthDate,
          deletedAt: null,
          driverCpf: scope.cpf,
        },
      });
      if (student) {
        return NextResponse.json({ type: "student", record: student });
      }
    }

    return NextResponse.json({ type: null, record: null });
  }

  if (cpfInput) {
    const normalizedCpf = normalizeCpfOrKeep(cpfInput);
    if (normalizedCpf !== scope.cpf) {
      return NextResponse.json({ type: null, record: null });
    }

    const guardian = await prisma.guardian.findFirst({
      where: {
        cpf: normalizedCpf,
        deletedAt: null,
      },
    });
    if (guardian) {
      return NextResponse.json({ type: "guardian", record: guardian });
    }
  }

  if (name && birthDate) {
    const student = await prisma.student.findFirst({
      where: {
        name,
        birthDate,
        deletedAt: null,
        guardianCpf: scope.cpf,
      },
    });
    if (student) {
      return NextResponse.json({ type: "student", record: student });
    }
  }

  return NextResponse.json({ type: null, record: null });
}

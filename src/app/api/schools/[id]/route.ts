import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const formatSchool = (school: {
  id: bigint;
  name: string;
  address: string;
  phone: string | null;
  contact: string | null;
  principal: string | null;
  doorman: string | null;
}) => ({
  id: school.id.toString(),
  name: school.name,
  address: school.address,
  phone: school.phone,
  contact: school.contact,
  principal: school.principal,
  doorman: school.doorman,
});

const sanitizeOptionalString = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const parseIdParam = (idParam: string | undefined) => {
  const trimmed = (idParam ?? "").trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    return null;
  }

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
    const schoolId = parseIdParam(params.id);

    if (schoolId === null) {
      return NextResponse.json(
        { error: "Identificador da escola inválido." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";

    if (!name || !address) {
      return NextResponse.json(
        { error: "Nome e endereço são obrigatórios." },
        { status: 400 },
      );
    }

    const school = await prisma.school.update({
      where: { id: schoolId },
      data: {
        name,
        address,
        phone: sanitizeOptionalString(body.phone),
        contact: sanitizeOptionalString(body.contact),
        principal: sanitizeOptionalString(body.principal),
        doorman: sanitizeOptionalString(body.doorman),
      },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        contact: true,
        principal: true,
        doorman: true,
      },
    });

    return NextResponse.json({ school: formatSchool(school) });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Escola não encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Não foi possível atualizar a escola." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const schoolId = parseIdParam(params.id);

    if (schoolId === null) {
      return NextResponse.json(
        { error: "Identificador da escola inválido." },
        { status: 400 },
      );
    }

    await prisma.school.delete({ where: { id: schoolId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Escola não encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Não foi possível remover a escola." },
      { status: 500 },
    );
  }
}

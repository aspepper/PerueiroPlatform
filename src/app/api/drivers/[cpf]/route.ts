import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ensureDriverUser } from "@/lib/user-accounts";

const formatDriver = (driver: {
  cpf: string;
  name: string;
  cnh: string | null;
  phone: string | null;
  email: string | null;
}) => ({
  cpf: driver.cpf,
  name: driver.name,
  cnh: driver.cnh,
  phone: driver.phone,
  email: driver.email,
});

const sanitizeOptionalString = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export async function PUT(
  request: Request,
  { params }: { params: { cpf: string } },
) {
  try {
    const cpfParam = decodeURIComponent(params.cpf ?? "").trim();

    if (!cpfParam) {
      return NextResponse.json(
        { error: "CPF inválido." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const password =
      typeof body.password === "string" && body.password.trim().length > 0
        ? body.password.trim()
        : undefined;

    if (!name) {
      return NextResponse.json(
        { error: "O nome é obrigatório." },
        { status: 400 },
      );
    }

    if (typeof body.cpf === "string" && body.cpf.trim() && body.cpf.trim() !== cpfParam) {
      return NextResponse.json(
        { error: "Não é permitido alterar o CPF do motorista." },
        { status: 400 },
      );
    }

    const driver = await prisma.driver.update({
      where: { cpf: cpfParam },
      data: {
        name,
        cnh: sanitizeOptionalString(body.cnh),
        phone: sanitizeOptionalString(body.phone),
        email: sanitizeOptionalString(body.email),
      },
      select: {
        cpf: true,
        name: true,
        cnh: true,
        phone: true,
        email: true,
        userId: true,
      },
    });

    await ensureDriverUser(
      {
        cpf: driver.cpf,
        name: driver.name,
        email: driver.email,
        userId: driver.userId,
      },
      { password },
    );

    return NextResponse.json({ driver: formatDriver(driver) });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Motorista não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Não foi possível atualizar o motorista." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { cpf: string } },
) {
  try {
    const cpfParam = decodeURIComponent(params.cpf ?? "").trim();

    if (!cpfParam) {
      return NextResponse.json(
        { error: "CPF inválido." },
        { status: 400 },
      );
    }

    await prisma.driver.delete({ where: { cpf: cpfParam } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Motorista não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Não foi possível remover o motorista." },
      { status: 500 },
    );
  }
}

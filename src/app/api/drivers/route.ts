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

const sanitizeRequiredString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const sanitizeOptionalString = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export async function GET() {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { name: "asc" },
      select: { cpf: true, name: true, cnh: true, phone: true, email: true },
    });

    return NextResponse.json({ drivers: drivers.map(formatDriver) });
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível carregar os motoristas." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cpf = sanitizeRequiredString(body.cpf);
    const name = sanitizeRequiredString(body.name);
    const password =
      typeof body.password === "string" && body.password.trim().length > 0
        ? body.password.trim()
        : undefined;

    if (!cpf || !name) {
      return NextResponse.json(
        { error: "Nome e CPF são obrigatórios." },
        { status: 400 },
      );
    }

    const driver = await prisma.driver.create({
      data: {
        cpf,
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

    return NextResponse.json({ driver: formatDriver(driver) }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Já existe um motorista cadastrado com este CPF." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Não foi possível cadastrar o motorista." },
      { status: 500 },
    );
  }
}

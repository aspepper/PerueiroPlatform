import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const formatDriver = (driver: {
  cpf: string;
  name: string;
  cnh: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}) => ({
  cpf: driver.cpf,
  name: driver.name,
  cnh: driver.cnh,
  phone: driver.phone,
  email: driver.email,
  address: driver.address,
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
      select: {
        cpf: true,
        name: true,
        cnh: true,
        phone: true,
        email: true,
        address: true,
      },
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
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Body malformado." },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Body malformado." }, { status: 400 });
  }

  const cpf = sanitizeRequiredString((body as Record<string, unknown>).cpf);
  const name = sanitizeRequiredString((body as Record<string, unknown>).name);

  if (!cpf || !name) {
    return NextResponse.json(
      { error: "Nome e CPF são obrigatórios." },
      { status: 400 },
    );
  }

  const existingDriver = await prisma.driver.findUnique({
    where: { cpf },
    select: { cpf: true },
  });

  if (existingDriver) {
    return NextResponse.json(
      { error: "Já existe um motorista cadastrado com este CPF." },
      { status: 400 },
    );
  }

  try {
    const driver = await prisma.driver.create({
      data: {
        cpf,
        name,
        cnh: sanitizeOptionalString((body as Record<string, unknown>).cnh),
        phone: sanitizeOptionalString((body as Record<string, unknown>).phone),
        email: sanitizeOptionalString((body as Record<string, unknown>).email),
        address: sanitizeOptionalString(
          (body as Record<string, unknown>).address,
        ),
      },
      select: {
        cpf: true,
        name: true,
        cnh: true,
        phone: true,
        email: true,
        address: true,
      },
    });

    return NextResponse.json({ driver: formatDriver(driver) }, { status: 201 });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Já existe um motorista cadastrado com este CPF." },
        { status: 400 },
      );
    }

    console.error("Erro ao criar driver:", e);
    const err = e as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

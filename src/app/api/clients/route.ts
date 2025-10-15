import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ensureGuardianUser } from "@/lib/user-accounts";

const formatClient = (client: {
  cpf: string;
  name: string;
  kinship: string;
  birthDate: Date | null;
  spouseName: string | null;
  address: string;
  mobile: string;
  landline: string | null;
  workAddress: string | null;
  workPhone: string | null;
}) => ({
  cpf: client.cpf,
  name: client.name,
  kinship: client.kinship,
  birthDate: client.birthDate?.toISOString() ?? null,
  spouseName: client.spouseName,
  address: client.address,
  mobile: client.mobile,
  landline: client.landline,
  workAddress: client.workAddress,
  workPhone: client.workPhone,
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

export async function GET() {
  try {
    const clients = await prisma.guardian.findMany({
      orderBy: { name: "asc" },
      select: {
        cpf: true,
        name: true,
        kinship: true,
        birthDate: true,
        spouseName: true,
        address: true,
        mobile: true,
        landline: true,
        workAddress: true,
        workPhone: true,
      },
    });

    return NextResponse.json({ clients: clients.map(formatClient) });
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível carregar os clientes." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cpf = sanitizeRequiredString(body.cpf);
    const name = sanitizeRequiredString(body.name);
    const kinship = sanitizeRequiredString(body.kinship);
    const address = sanitizeRequiredString(body.address);
    const mobile = sanitizeRequiredString(body.mobile);
    const password =
      typeof body.password === "string" && body.password.trim().length > 0
        ? body.password.trim()
        : undefined;

    if (!cpf || !name || !kinship || !address || !mobile) {
      return NextResponse.json(
        { error: "CPF, nome, vínculo, endereço e celular são obrigatórios." },
        { status: 400 },
      );
    }

    const client = await prisma.guardian.create({
      data: {
        cpf,
        name,
        kinship,
        address,
        mobile,
        birthDate: sanitizeOptionalDate(body.birthDate),
        spouseName: sanitizeOptionalString(body.spouseName),
        landline: sanitizeOptionalString(body.landline),
        workAddress: sanitizeOptionalString(body.workAddress),
        workPhone: sanitizeOptionalString(body.workPhone),
      },
      select: {
        cpf: true,
        name: true,
        kinship: true,
        birthDate: true,
        spouseName: true,
        address: true,
        mobile: true,
        landline: true,
        workAddress: true,
        workPhone: true,
        userId: true,
      },
    });

    await ensureGuardianUser(
      {
        cpf: client.cpf,
        name: client.name,
        userId: client.userId,
      },
      { password },
    );

    return NextResponse.json({ client: formatClient(client) }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Já existe um cliente cadastrado com este CPF." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Não foi possível cadastrar o cliente." },
      { status: 500 },
    );
  }
}

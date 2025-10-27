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

export async function GET(
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

    const client = await prisma.guardian.findUnique({
      where: { cpf: cpfParam },
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

    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json({ client: formatClient(client) });
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível carregar o cliente." },
      { status: 500 },
    );
  }
}

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
    const kinship = typeof body.kinship === "string" ? body.kinship.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const mobile = typeof body.mobile === "string" ? body.mobile.trim() : "";
    const password =
      typeof body.password === "string" && body.password.trim().length > 0
        ? body.password.trim()
        : undefined;

    if (!name || !kinship || !address || !mobile) {
      return NextResponse.json(
        { error: "Nome, vínculo, endereço e celular são obrigatórios." },
        { status: 400 },
      );
    }

    if (typeof body.cpf === "string" && body.cpf.trim() && body.cpf.trim() !== cpfParam) {
      return NextResponse.json(
        { error: "Não é permitido alterar o CPF do cliente." },
        { status: 400 },
      );
    }

    const client = await prisma.guardian.update({
      where: { cpf: cpfParam },
      data: {
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

    return NextResponse.json({ client: formatClient(client) });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Cliente não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Não foi possível atualizar o cliente." },
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

    await prisma.guardian.delete({ where: { cpf: cpfParam } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Cliente não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Não foi possível remover o cliente." },
      { status: 500 },
    );
  }
}

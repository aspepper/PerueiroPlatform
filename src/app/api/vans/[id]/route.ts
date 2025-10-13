import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const formatVan = (van: {
  id: bigint;
  model: string;
  color: string | null;
  year: string | null;
  plate: string;
  driverCpf: string | null;
  driver: { name: string } | null;
}) => ({
  id: van.id.toString(),
  model: van.model,
  color: van.color,
  year: van.year,
  plate: van.plate,
  driverCpf: van.driverCpf,
  driverName: van.driver?.name ?? null,
});

const sanitizeOptionalString = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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
    const vanId = parseIdParam(params.id);

    if (vanId === null) {
      return NextResponse.json(
        { error: "Identificador da van inválido." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const model = typeof body.model === "string" ? body.model.trim() : "";
    const plate = typeof body.plate === "string" ? body.plate.trim() : "";

    if (!model || !plate) {
      return NextResponse.json(
        { error: "Modelo e placa são obrigatórios." },
        { status: 400 },
      );
    }

    const van = await prisma.van.update({
      where: { id: vanId },
      data: {
        model,
        plate,
        color: sanitizeOptionalString(body.color),
        year: sanitizeOptionalString(body.year),
        driverCpf: sanitizeOptionalString(body.driverCpf),
      },
      select: {
        id: true,
        model: true,
        color: true,
        year: true,
        plate: true,
        driverCpf: true,
        driver: { select: { name: true } },
      },
    });

    return NextResponse.json({ van: formatVan(van) });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Van não encontrada." },
        { status: 404 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Já existe uma van cadastrada com esta placa." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Não foi possível atualizar a van." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const vanId = parseIdParam(params.id);

    if (vanId === null) {
      return NextResponse.json(
        { error: "Identificador da van inválido." },
        { status: 400 },
      );
    }

    await prisma.van.delete({ where: { id: vanId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Van não encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Não foi possível remover a van." },
      { status: 500 },
    );
  }
}

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

const sanitizeRequiredString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const sanitizeOptionalString = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export async function GET() {
  try {
    const vans = await prisma.van.findMany({
      orderBy: { model: "asc" },
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

    return NextResponse.json({ vans: vans.map(formatVan) });
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível carregar as vans." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const model = sanitizeRequiredString(body.model);
    const plate = sanitizeRequiredString(body.plate);

    if (!model || !plate) {
      return NextResponse.json(
        { error: "Modelo e placa são obrigatórios." },
        { status: 400 },
      );
    }

    const van = await prisma.van.create({
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

    return NextResponse.json({ van: formatVan(van) }, { status: 201 });
  } catch (error) {
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
      { error: "Não foi possível cadastrar a van." },
      { status: 500 },
    );
  }
}

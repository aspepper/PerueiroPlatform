import { NextResponse } from "next/server";

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

const sanitizeRequiredString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const sanitizeOptionalString = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export async function GET() {
  try {
    const schools = await prisma.school.findMany({
      orderBy: { name: "asc" },
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

    return NextResponse.json({ schools: schools.map(formatSchool) });
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível carregar as escolas." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = sanitizeRequiredString(body.name);
    const address = sanitizeRequiredString(body.address);

    if (!name || !address) {
      return NextResponse.json(
        { error: "Nome e endereço são obrigatórios." },
        { status: 400 },
      );
    }

    const school = await prisma.school.create({
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

    return NextResponse.json({ school: formatSchool(school) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Não foi possível cadastrar a escola." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const parseBigIntParam = (value: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  return BigInt(trimmed);
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const guardianCpf = searchParams.get("guardianCpf")?.trim() || null;
    const driverCpf = searchParams.get("driverCpf")?.trim() || null;
    const vanId = parseBigIntParam(searchParams.get("vanId"));

    if (!guardianCpf && !driverCpf && !vanId) {
      return NextResponse.json(
        { error: "Informe guardianCpf, driverCpf ou vanId." },
        { status: 400 },
      );
    }

    const contracts = await prisma.contract.findMany({
      where: {
        signed: true,
        ...(guardianCpf ? { guardianCpf } : {}),
        ...(vanId ? { vanId } : {}),
        ...(driverCpf ? { van: { driverCpf } } : {}),
      },
      include: {
        student: true,
        guardian: true,
        van: true,
      },
      orderBy: { signedAt: "desc" },
    });

    const payload = contracts.map((contract) => ({
      id: contract.id.toString(),
      studentId: contract.studentId.toString(),
      studentName: contract.student.name,
      guardianCpf: contract.guardianCpf,
      guardianName: contract.guardian.name,
      vanId: contract.vanId.toString(),
      driverCpf: contract.van.driverCpf ?? null,
      period: contract.period,
      startDate: contract.startDate.toISOString(),
      endDate: contract.endDate.toISOString(),
      billingDay: contract.billingDay,
      rescissionFine: contract.rescissionFine,
      forumCity: contract.forumCity,
      pdfUrl: contract.pdfUrl,
      signedPdfUrl: contract.signedPdfUrl,
      signed: contract.signed,
      signedAt: contract.signedAt?.toISOString() ?? null,
      createdAt: contract.createdAt.toISOString(),
    }));

    return NextResponse.json({ contracts: payload }, { status: 200 });
  } catch (error) {
    console.error("[contracts] Erro ao listar assinados:", error);
    return NextResponse.json(
      { error: "Não foi possível listar contratos assinados." },
      { status: 500 },
    );
  }
}

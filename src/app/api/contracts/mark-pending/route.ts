import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const contractIdRaw = typeof body?.contractId === "string" ? body.contractId.trim() : "";
    const driverCpf = typeof body?.driverCpf === "string" ? body.driverCpf.trim() : "";

    if (!/^\d+$/.test(contractIdRaw) || !driverCpf) {
      return NextResponse.json(
        { error: "contractId e driverCpf são obrigatórios." },
        { status: 400 },
      );
    }

    const contractId = BigInt(contractIdRaw);
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: { van: true },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado." }, { status: 404 });
    }

    if (contract.van?.driverCpf !== driverCpf) {
      return NextResponse.json(
        { error: "Motorista não autorizado para este contrato." },
        { status: 403 },
      );
    }

    await prisma.contract.update({
      where: { id: contract.id },
      data: {
        signed: false,
        signedAt: null,
        signedPdfUrl: null,
      },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("[contracts] Erro ao marcar contrato como pendente:", error);
    return NextResponse.json(
      { error: "Não foi possível marcar o contrato como pendente." },
      { status: 500 },
    );
  }
}

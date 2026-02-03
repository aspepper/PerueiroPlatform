import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { sendContractEmail } from "@/lib/email/sendContractEmail";

export const dynamic = "force-dynamic";

type SendRequest = {
  contractIds?: string[];
  vanId?: string;
  guardianCpf?: string;
};

const parseBigIntParam = (value?: string) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  return BigInt(trimmed);
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SendRequest;
    const contractIds = Array.isArray(body.contractIds) ? body.contractIds : [];
    const vanId = parseBigIntParam(body.vanId);
    const guardianCpf = body.guardianCpf?.trim();

    const parsedContractIds = contractIds
      .map((id) => (typeof id === "string" && /^\d+$/.test(id.trim()) ? BigInt(id.trim()) : null))
      .filter((id): id is bigint => id !== null);

    if (!parsedContractIds.length && !vanId && !guardianCpf) {
      return NextResponse.json(
        { error: "Informe contractIds, vanId ou guardianCpf para enviar." },
        { status: 400 },
      );
    }

    const whereClause = parsedContractIds.length
      ? { id: { in: parsedContractIds } }
      : {
          signed: false,
          ...(vanId ? { vanId } : {}),
          ...(guardianCpf ? { guardianCpf } : {}),
        };

    const contracts = await prisma.contract.findMany({
      where: whereClause,
      include: { guardian: { include: { user: true } } },
    });

    if (!contracts.length) {
      return NextResponse.json(
        { error: "Nenhum contrato encontrado para envio." },
        { status: 404 },
      );
    }

    const results: Array<{ contractId: string; sent: boolean; error?: string }> = [];

    for (const contract of contracts) {
      const email = contract.guardian.user?.email ?? null;
      if (!email) {
        results.push({
          contractId: contract.id.toString(),
          sent: false,
          error: "Responsável sem e-mail cadastrado.",
        });
        continue;
      }

      await sendContractEmail(email, contract.id.toString());
      console.info("[contracts] Notificação in-app pendente de integração.", {
        contractId: contract.id.toString(),
      });
      results.push({ contractId: contract.id.toString(), sent: true });
    }

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    console.error("[contracts] Erro ao enviar contratos:", error);
    return NextResponse.json(
      { error: "Não foi possível enviar os contratos." },
      { status: 500 },
    );
  }
}

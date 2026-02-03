import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { uploadSignedContract } from "@/lib/storage/r2";

export const dynamic = "force-dynamic";

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const contractIdRaw = formData.get("contractId");
    const guardianCpfRaw = formData.get("guardianCpf");
    const file = formData.get("file");

    const contractId =
      typeof contractIdRaw === "string" && /^\d+$/.test(contractIdRaw.trim())
        ? BigInt(contractIdRaw.trim())
        : null;
    const guardianCpf =
      typeof guardianCpfRaw === "string" ? guardianCpfRaw.trim() : "";

    if (!contractId || !guardianCpf) {
      return NextResponse.json(
        { error: "contractId e guardianCpf são obrigatórios." },
        { status: 400 },
      );
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Arquivo inválido." },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Formato de arquivo não permitido." },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: "Arquivo excede o limite de 10MB." },
        { status: 400 },
      );
    }

    const contract = await prisma.contract.findUnique({ where: { id: contractId } });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado." }, { status: 404 });
    }

    if (contract.guardianCpf !== guardianCpf) {
      return NextResponse.json(
        { error: "Responsável não autorizado para este contrato." },
        { status: 403 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const signedPdfUrl = await uploadSignedContract(
      buffer,
      contract.id.toString(),
      file.type,
    );

    await prisma.contract.update({
      where: { id: contract.id },
      data: {
        signed: true,
        signedAt: new Date(),
        signedPdfUrl,
      },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("[contracts] Erro ao enviar contrato assinado:", error);
    return NextResponse.json(
      { error: "Não foi possível enviar o contrato assinado." },
      { status: 500 },
    );
  }
}

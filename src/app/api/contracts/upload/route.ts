import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { uploadSignedContract } from "@/lib/storage/r2";
import { isTokenExpired } from "@/lib/auth/token";

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
    const token = typeof formData.get("token") === "string" ? String(formData.get("token")).trim() : "";
    const parentId =
      typeof formData.get("parentId") === "string" ? String(formData.get("parentId")).trim() : "";
    const file = formData.get("file");

    if (!token || !parentId) {
      return NextResponse.json(
        { error: "Token e responsável são obrigatórios." },
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

    const contract = await prisma.contract.findUnique({ where: { token } });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado." }, { status: 404 });
    }

    if (contract.parentId !== parentId) {
      return NextResponse.json(
        { error: "Responsável não autorizado para este contrato." },
        { status: 403 },
      );
    }

    if (isTokenExpired(contract.tokenExpiry)) {
      if (contract.status !== "EXPIRED") {
        await prisma.contract.update({
          where: { id: contract.id },
          data: { status: "EXPIRED" },
        });
      }
      return NextResponse.json(
        { error: "Token expirado. Solicite um novo contrato." },
        { status: 410 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const signedUrl = await uploadSignedContract(buffer, contract.id, file.type);

    await prisma.contract.update({
      where: { id: contract.id },
      data: {
        signedUrl,
        status: "SIGNED_UPLOAD",
        signedAt: new Date(),
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

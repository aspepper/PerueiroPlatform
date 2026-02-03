import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createContractToken } from "@/lib/auth/token";
import { generateContractPdf } from "@/lib/pdf/generateContract";
import { uploadOriginalContract } from "@/lib/storage/r2";
import { sendContractEmail } from "@/lib/email/sendContractEmail";

export const dynamic = "force-dynamic";

const parseBigInt = (value: unknown) => {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return BigInt(value);
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return BigInt(value.trim());
  }
  return null;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const studentId = parseBigInt(body?.studentId);
    const parentId = typeof body?.parentId === "string" ? body.parentId.trim() : "";
    const driverId = typeof body?.driverId === "string" ? body.driverId.trim() : "";

    if (!studentId || !parentId || !driverId) {
      return NextResponse.json(
        { error: "studentId, parentId e driverId são obrigatórios." },
        { status: 400 },
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        guardian: true,
        school: true,
        driver: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Aluno não encontrado." }, { status: 404 });
    }

    if (student.guardianCpf !== parentId) {
      return NextResponse.json(
        { error: "Responsável não corresponde ao aluno informado." },
        { status: 403 },
      );
    }

    if (student.driverCpf !== driverId) {
      return NextResponse.json(
        { error: "Motorista não corresponde ao aluno informado." },
        { status: 403 },
      );
    }

    const guardian = student.guardian;
    const driver = student.driver;

    if (!guardian) {
      return NextResponse.json(
        { error: "Responsável não encontrado para o aluno." },
        { status: 404 },
      );
    }

    const { token, tokenExpiry } = createContractToken();
    const pdfBuffer = await generateContractPdf({
      studentName: student.name,
      studentBirthDate: student.birthDate,
      guardianName: guardian.name,
      guardianAddress: guardian.address,
      guardianPhone: guardian.mobile ?? guardian.landline ?? null,
      schoolName: student.school?.name ?? null,
      studentGrade: student.grade ?? null,
      driverName: driver?.name ?? null,
    });

    const contractId = crypto.randomUUID();
    const pdfUrl = await uploadOriginalContract(pdfBuffer, contractId);

    const contract = await prisma.contract.create({
      data: {
        id: contractId,
        studentId: student.id.toString(),
        parentId,
        driverId,
        pdfUrl,
        token,
        tokenExpiry,
        status: "PENDING",
      },
    });

    const guardianEmail = guardian.userId
      ? (await prisma.user.findUnique({ where: { id: guardian.userId } }))?.email
      : null;

    if (guardianEmail) {
      await sendContractEmail(guardianEmail, token);
    } else {
      console.info("[contracts] Responsável sem e-mail, notificação apenas no app.");
    }

    return NextResponse.json({ id: contract.id, token }, { status: 201 });
  } catch (error) {
    console.error("[contracts] Erro ao gerar contrato:", error);
    return NextResponse.json(
      { error: "Não foi possível gerar o contrato." },
      { status: 500 },
    );
  }
}

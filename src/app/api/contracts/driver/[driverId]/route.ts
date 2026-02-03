import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { driverId: string } },
) {
  try {
    const driverId = params.driverId?.trim();
    if (!driverId) {
      return NextResponse.json(
        { error: "DriverId inválido." },
        { status: 400 },
      );
    }

    const contracts = await prisma.contract.findMany({
      where: { driverId },
      orderBy: { createdAt: "desc" },
    });

    const studentIds = contracts
      .map((contract) => contract.studentId)
      .filter((value) => /^\d+$/.test(value));

    const students = studentIds.length
      ? await prisma.student.findMany({
          where: { id: { in: studentIds.map((id) => BigInt(id)) } },
          include: { guardian: true },
        })
      : [];

    const studentMap = new Map(
      students.map((student) => [
        student.id.toString(),
        {
          name: student.name,
          guardianName: student.guardian?.name ?? null,
        },
      ]),
    );

    const now = Date.now();
    const signed = [];
    const pending = [];

    for (const contract of contracts) {
      const studentInfo = studentMap.get(contract.studentId) ?? null;
      const basePayload = {
        id: contract.id,
        studentId: contract.studentId,
        studentName: studentInfo?.name ?? null,
        guardianName: studentInfo?.guardianName ?? null,
        status: contract.status,
        pdfUrl: contract.pdfUrl,
        signedUrl: contract.signedUrl ?? null,
        createdAt: contract.createdAt.toISOString(),
        signedAt: contract.signedAt?.toISOString() ?? null,
        tokenExpiry: contract.tokenExpiry.toISOString(),
      };

      if (
        contract.status === "SIGNED_DIGITAL" ||
        contract.status === "SIGNED_UPLOAD"
      ) {
        signed.push(basePayload);
      } else if (contract.tokenExpiry.getTime() > now) {
        pending.push(basePayload);
      }
    }

    return NextResponse.json({ signed, pending });
  } catch (error) {
    console.error("[contracts] Erro ao listar contratos do motorista:", error);
    return NextResponse.json(
      { error: "Não foi possível listar os contratos." },
      { status: 500 },
    );
  }
}

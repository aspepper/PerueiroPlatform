import { NextRequest, NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const ACTIVE_STATUSES: PaymentStatus[] = [
  PaymentStatus.PENDING,
  PaymentStatus.OVERDUE,
  PaymentStatus.PAID,
];

const sanitizeYear = (value: string | null | undefined) => {
  if (!value) return new Date().getUTCFullYear();
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return new Date().getUTCFullYear();
  return parsed;
};

const buildPeriodRange = (year: number) => ({
  start: new Date(Date.UTC(year, 0, 1, 0, 0, 0)),
  end: new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0)),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { year?: string } },
) {
  try {
    const year = sanitizeYear(params.year);
    const { start, end } = buildPeriodRange(year);

    const payments = await prisma.payment.findMany({
      where: {
        status: { in: ACTIVE_STATUSES },
        dueDate: { gte: start, lt: end },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            guardian: { select: { cpf: true, name: true } },
          },
        },
        van: {
          select: {
            id: true,
            model: true,
            plate: true,
            driver: { select: { cpf: true, name: true } },
          },
        },
      },
      orderBy: [{ dueDate: "asc" }],
    });

    const formatted = payments.map((payment) => ({
      id: payment.id.toString(),
      studentId: payment.studentId.toString(),
      studentName: payment.student?.name ?? null,
      guardianCpf: payment.student?.guardian?.cpf ?? null,
      guardianName: payment.student?.guardian?.name ?? null,
      vanId: payment.van?.id ? payment.van.id.toString() : null,
      vanModel: payment.van?.model ?? null,
      vanPlate: payment.van?.plate ?? null,
      vanOwnerCpf: payment.van?.driver?.cpf ?? null,
      vanOwnerName: payment.van?.driver?.name ?? null,
      dueDate: payment.dueDate.toISOString(),
      status: payment.status,
      amount: Number(payment.amount),
      discount: Number(payment.discount),
      netAmount: Number(payment.amount) - Number(payment.discount ?? 0),
      paidAt: payment.paidAt ? payment.paidAt.toISOString() : null,
    }));

    return NextResponse.json({ year, payments: formatted });
  } catch (error) {
    console.error("Falha ao carregar pagamentos:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar os pagamentos." },
      { status: 500 },
    );
  }
}

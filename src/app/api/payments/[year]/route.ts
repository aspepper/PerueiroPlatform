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
      select: {
        id: true,
        studentId: true,
        vanId: true,
        dueDate: true,
        status: true,
        amount: true,
        discount: true,
        paidAt: true,
      },
      orderBy: [{ dueDate: "asc" }],
    });

    const studentIds = [...new Set(payments.map((payment) => payment.studentId))];
    const vanIds = [
      ...new Set(payments.map((payment) => payment.vanId).filter((id): id is bigint => id !== null)),
    ];

    const students = studentIds.length
      ? await prisma.student.findMany({
          where: { id: { in: studentIds } },
          select: { id: true, name: true, guardianCpf: true },
        })
      : [];

    const guardianCpfs = [
      ...new Set(
        students
          .map((student) => student.guardianCpf)
          .filter((cpf): cpf is string => cpf !== null),
      ),
    ];
    const guardians = guardianCpfs.length
      ? await prisma.guardian.findMany({
          where: { cpf: { in: guardianCpfs } },
          select: { cpf: true, name: true },
        })
      : [];

    const vans = vanIds.length
      ? await prisma.van.findMany({
          where: { id: { in: vanIds } },
          select: { id: true, model: true, plate: true, driverCpf: true },
        })
      : [];

    const driverCpfs = [
      ...new Set(
        vans
          .map((van) => van.driverCpf)
          .filter((cpf): cpf is string => cpf !== null),
      ),
    ];
    const drivers = driverCpfs.length
      ? await prisma.driver.findMany({
          where: { cpf: { in: driverCpfs } },
          select: { cpf: true, name: true },
        })
      : [];

    const studentById = new Map(students.map((student) => [student.id.toString(), student]));
    const guardianByCpf = new Map(guardians.map((guardian) => [guardian.cpf, guardian]));
    const vanById = new Map(vans.map((van) => [van.id.toString(), van]));
    const driverByCpf = new Map(drivers.map((driver) => [driver.cpf, driver]));

    const formatted = payments.map((payment) => ({
      id: payment.id.toString(),
      studentId: payment.studentId.toString(),
      studentName: studentById.get(payment.studentId.toString())?.name ?? null,
      guardianCpf: studentById.get(payment.studentId.toString())?.guardianCpf ?? null,
      guardianName:
        guardianByCpf.get(studentById.get(payment.studentId.toString())?.guardianCpf ?? "")?.name ??
        null,
      vanId: payment.vanId ? payment.vanId.toString() : null,
      vanModel: payment.vanId ? vanById.get(payment.vanId.toString())?.model ?? null : null,
      vanPlate: payment.vanId ? vanById.get(payment.vanId.toString())?.plate ?? null : null,
      vanOwnerCpf: payment.vanId ? vanById.get(payment.vanId.toString())?.driverCpf ?? null : null,
      vanOwnerName: payment.vanId
        ? driverByCpf.get(vanById.get(payment.vanId.toString())?.driverCpf ?? "")?.name ?? null
        : null,
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

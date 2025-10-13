import { prisma } from "@/lib/prisma";
import { PaymentStatus, Prisma } from "@prisma/client";

export type StudentPaymentSnapshot = {
  id: bigint;
  guardianCpf: string | null;
  vanId: bigint | null;
};

const ACTIVE_STATUSES: PaymentStatus[] = [
  PaymentStatus.PENDING,
  PaymentStatus.OVERDUE,
  PaymentStatus.PAID,
];

function buildStartOfYear(year: number) {
  return new Date(Date.UTC(year, 0, 1, 0, 0, 0));
}

function resolveDueDateForMonth(year: number, monthIndex: number, billingDay: number) {
  const clampedDay = Math.min(Math.max(billingDay, 1), 31);
  const candidate = new Date(Date.UTC(year, monthIndex, clampedDay, 3, 0, 0));

  if (candidate.getUTCMonth() !== monthIndex) {
    // Month overflow (e.g. February 30th). Use the last day of the month.
    return new Date(Date.UTC(year, monthIndex + 1, 0, 3, 0, 0));
  }

  return candidate;
}

async function disablePaymentsForStudentVan(studentId: bigint, vanId: bigint) {
  await prisma.payment.updateMany({
    where: {
      studentId,
      vanId,
      boletoId: null,
      status: { in: [PaymentStatus.PENDING, PaymentStatus.OVERDUE] },
    },
    data: { status: PaymentStatus.CANCELED },
  });
}

async function createMissingPayments(student: StudentPaymentSnapshot) {
  if (!student.guardianCpf || !student.vanId) return;

  const [van, existingPayments] = await Promise.all([
    prisma.van.findUnique({
      where: { id: student.vanId },
      select: { billingDay: true, monthlyFee: true },
    }),
    prisma.payment.findMany({
      where: {
        studentId: student.id,
        vanId: student.vanId,
        status: { in: ACTIVE_STATUSES },
      },
      select: { dueDate: true },
    }),
  ]);

  if (!van) return;

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const startOfYear = buildStartOfYear(currentYear);

  const activeForYear = existingPayments
    .filter((payment) => payment.dueDate >= startOfYear)
    .map((payment) => `${payment.dueDate.getUTCFullYear()}-${payment.dueDate.getUTCMonth()}`);
  const existingSet = new Set(activeForYear);

  const startMonth = (() => {
    const firstDueDate = resolveDueDateForMonth(
      currentYear,
      now.getUTCMonth(),
      van.billingDay,
    );

    if (firstDueDate >= now) {
      return now.getUTCMonth();
    }

    return now.getUTCMonth() + 1;
  })();

  const creations: Prisma.PaymentCreateManyInput[] = [];

  for (let month = startMonth; month < 12; month += 1) {
    const dueDate = resolveDueDateForMonth(currentYear, month, van.billingDay);
    const key = `${dueDate.getUTCFullYear()}-${dueDate.getUTCMonth()}`;
    if (existingSet.has(key)) continue;

    creations.push({
      studentId: student.id,
      vanId: student.vanId,
      amount: van.monthlyFee,
      discount: new Prisma.Decimal(0),
      status: PaymentStatus.PENDING,
      dueDate,
    });
  }

  if (creations.length > 0) {
    await prisma.payment.createMany({ data: creations });
  }
}

export async function reconcileStudentPayments(
  previous: StudentPaymentSnapshot | null,
  next: StudentPaymentSnapshot,
) {
  if (previous?.vanId && (!next.vanId || previous.vanId !== next.vanId)) {
    await disablePaymentsForStudentVan(previous.id, previous.vanId);
  }

  if (next.guardianCpf && next.vanId) {
    await createMissingPayments(next);
  }
}

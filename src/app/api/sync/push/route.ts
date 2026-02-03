import { NextResponse } from "next/server";

import { PaymentStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { STUDENT_SCOPE_SELECT } from "@/lib/prisma-selects";
import { requireMobileJwt, resolveSyncScope } from "../shared";

type SyncOperationPayload = {
  queueId: number;
  entityType: string;
  entityId?: string | null;
  operation: string;
  clientUpdatedAt?: number | null;
  payload?: Record<string, unknown>;
};

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function isConflict(serverUpdatedAt: Date | null, clientUpdatedAt?: number | null) {
  if (!clientUpdatedAt || !serverUpdatedAt) return false;
  return serverUpdatedAt.getTime() > clientUpdatedAt;
}

function toBigInt(value: unknown) {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isFinite(value)) return BigInt(Math.trunc(value));
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return BigInt(Math.trunc(parsed));
  }
  return null;
}

function normalizeOperation(operation: string) {
  const op = operation.toUpperCase();
  if (op === "CREATE" || op === "UPDATE" || op === "UPSERT") return "UPSERT";
  if (op === "DELETE") return "DELETE";
  return null;
}

const PAYMENT_STATUSES = new Set(Object.values(PaymentStatus));

function resolvePaymentStatus(value: unknown) {
  if (typeof value === "string") {
    const normalized = value.toUpperCase();
    if (PAYMENT_STATUSES.has(normalized as PaymentStatus)) {
      return normalized as PaymentStatus;
    }
  }
  return PaymentStatus.PENDING;
}

export async function POST(request: Request) {
  const { unauthorized, payload } = await requireMobileJwt(request);
  if (unauthorized) return unauthorized;

  const scope = await resolveSyncScope(payload!);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { operations?: SyncOperationPayload[] };
  try {
    body = await request.json();
  } catch {
    return badRequest("Corpo da requisição inválido.");
  }

  if (!Array.isArray(body.operations)) {
    return badRequest("Lista de operações é obrigatória.");
  }

  const applied: number[] = [];
  const conflicts: number[] = [];

  for (const operation of body.operations) {
    const normalized = normalizeOperation(operation.operation ?? "");
    if (!normalized || typeof operation.queueId !== "number") {
      continue;
    }

    try {
      const entityType = (operation.entityType ?? "").toLowerCase();
      const clientUpdatedAt = operation.clientUpdatedAt ?? null;
      const payloadData = operation.payload ?? {};

      if (normalized === "DELETE") {
        await handleDelete(entityType, payloadData, scope);
        applied.push(operation.queueId);
        continue;
      }

      const conflict = await handleUpsert(
        entityType,
        payloadData,
        clientUpdatedAt,
        scope,
      );
      if (conflict) {
        conflicts.push(operation.queueId);
      } else {
        applied.push(operation.queueId);
      }
    } catch (error) {
      console.error("Falha ao processar operação de sync", error);
    }
  }

  return NextResponse.json({ applied, conflicts });
}

async function handleDelete(
  entityType: string,
  payload: Record<string, unknown>,
  scope: { role: "DRIVER" | "GUARDIAN"; cpf: string },
) {
  const now = new Date();
  if (entityType === "guardian") {
    if (scope.role !== "GUARDIAN") return;
    const cpf = String(payload.cpf ?? "");
    if (cpf && cpf === scope.cpf) {
      await prisma.guardian.update({
        where: { cpf },
        data: { deletedAt: now },
      });
    }
    return;
  }

  if (entityType === "driver") {
    if (scope.role !== "DRIVER") return;
    const cpf = String(payload.cpf ?? "");
    if (cpf && cpf === scope.cpf) {
      await prisma.driver.update({
        where: { cpf },
        data: { deletedAt: now },
      });
    }
    return;
  }

  if (entityType === "student") {
    const id = toBigInt(payload.id);
    if (!id) return;
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return;
    if (scope.role === "DRIVER" && student.driverCpf !== scope.cpf) return;
    if (scope.role === "GUARDIAN" && student.guardianCpf !== scope.cpf) return;
    await prisma.student.update({ where: { id }, data: { deletedAt: now } });
    return;
  }

  if (entityType === "payment") {
    const id = toBigInt(payload.id);
    if (!id) return;
    const payment = await prisma.payment.findUnique({
      where: { id },
      select: { student: { select: STUDENT_SCOPE_SELECT } },
    });
    if (!payment) return;
    if (scope.role === "DRIVER" && payment.student.driverCpf !== scope.cpf) return;
    if (scope.role === "GUARDIAN" && payment.student.guardianCpf !== scope.cpf) return;
    await prisma.payment.update({ where: { id }, data: { deletedAt: now } });
    return;
  }

  if (entityType === "van") {
    if (scope.role !== "DRIVER") return;
    const id = toBigInt(payload.id);
    if (!id) return;
    const van = await prisma.van.findUnique({ where: { id } });
    if (!van || van.driverCpf !== scope.cpf) return;
    await prisma.van.update({ where: { id }, data: { deletedAt: now } });
    return;
  }

  if (entityType === "school") {
    const id = toBigInt(payload.id);
    if (!id) return;
    await prisma.school.update({ where: { id }, data: { deletedAt: now } });
  }
}

async function handleUpsert(
  entityType: string,
  payload: Record<string, unknown>,
  clientUpdatedAt: number | null,
  scope: { role: "DRIVER" | "GUARDIAN"; cpf: string },
) {
  if (entityType === "guardian") {
    if (scope.role !== "GUARDIAN") return true;
    const cpf = String(payload.cpf ?? "");
    if (!cpf || cpf !== scope.cpf) return true;
    const existing = await prisma.guardian.findUnique({ where: { cpf } });
    if (existing && isConflict(existing.updatedAt, clientUpdatedAt)) return true;
    await prisma.guardian.upsert({
      where: { cpf },
      update: {
        name: String(payload.name ?? existing?.name ?? ""),
        kinship: String(payload.kinship ?? existing?.kinship ?? ""),
        rg: payload.rg ? String(payload.rg) : existing?.rg,
        birthDate: payload.birthDate ? new Date(String(payload.birthDate)) : existing?.birthDate,
        spouseName: payload.spouseName ? String(payload.spouseName) : existing?.spouseName,
        address: String(payload.address ?? existing?.address ?? ""),
        mobile: String(payload.mobile ?? existing?.mobile ?? ""),
        landline: payload.landline ? String(payload.landline) : existing?.landline,
        workAddress: payload.workAddress ? String(payload.workAddress) : existing?.workAddress,
        workPhone: payload.workPhone ? String(payload.workPhone) : existing?.workPhone,
        deletedAt: null,
      },
      create: {
        cpf,
        name: String(payload.name ?? ""),
        kinship: String(payload.kinship ?? ""),
        rg: payload.rg ? String(payload.rg) : null,
        birthDate: payload.birthDate ? new Date(String(payload.birthDate)) : null,
        spouseName: payload.spouseName ? String(payload.spouseName) : null,
        address: String(payload.address ?? ""),
        mobile: String(payload.mobile ?? ""),
        landline: payload.landline ? String(payload.landline) : null,
        workAddress: payload.workAddress ? String(payload.workAddress) : "",
        workPhone: payload.workPhone ? String(payload.workPhone) : null,
      },
    });
    return false;
  }

  if (entityType === "driver") {
    if (scope.role !== "DRIVER") return true;
    const cpf = String(payload.cpf ?? "");
    if (!cpf || cpf !== scope.cpf) return true;
    const existing = await prisma.driver.findUnique({ where: { cpf } });
    if (existing && isConflict(existing.updatedAt, clientUpdatedAt)) return true;
    await prisma.driver.upsert({
      where: { cpf },
      update: {
        name: String(payload.name ?? existing?.name ?? ""),
        cnh: payload.cnh ? String(payload.cnh) : existing?.cnh,
        phone: payload.phone ? String(payload.phone) : existing?.phone,
        email: payload.email ? String(payload.email) : existing?.email,
        address: payload.address ? String(payload.address) : existing?.address,
        deletedAt: null,
      },
      create: {
        cpf,
        name: String(payload.name ?? ""),
        cnh: payload.cnh ? String(payload.cnh) : null,
        phone: payload.phone ? String(payload.phone) : null,
        email: payload.email ? String(payload.email) : null,
        address: payload.address ? String(payload.address) : null,
      },
    });
    return false;
  }

  if (entityType === "student") {
    const id = toBigInt(payload.id);
    const guardianCpf = payload.guardianCpf ? String(payload.guardianCpf) : null;
    const driverCpf = payload.driverCpf ? String(payload.driverCpf) : null;
    if (scope.role === "DRIVER" && driverCpf !== scope.cpf) return true;
    if (scope.role === "GUARDIAN" && guardianCpf !== scope.cpf) return true;

    if (id) {
      const existing = await prisma.student.findUnique({ where: { id } });
      if (existing && isConflict(existing.updatedAt, clientUpdatedAt)) return true;
    }

    await prisma.student.upsert({
      where: { id: id ?? BigInt(0) },
      update: {
        name: String(payload.name ?? ""),
        cpf: payload.cpf ? String(payload.cpf) : null,
        rg: payload.rg ? String(payload.rg) : null,
        period: payload.period ? String(payload.period) : null,
        birthDate: payload.birthDate ? new Date(String(payload.birthDate)) : null,
        grade: payload.grade ? String(payload.grade) : null,
        guardianCpf,
        schoolId: toBigInt(payload.schoolId),
        vanId: toBigInt(payload.vanId),
        driverCpf,
        mobile: payload.mobile ? String(payload.mobile) : null,
        deletedAt: null,
      },
      create: {
        name: String(payload.name ?? ""),
        cpf: payload.cpf ? String(payload.cpf) : null,
        rg: payload.rg ? String(payload.rg) : null,
        period: payload.period ? String(payload.period) : null,
        birthDate: payload.birthDate ? new Date(String(payload.birthDate)) : null,
        grade: payload.grade ? String(payload.grade) : null,
        guardianCpf,
        schoolId: toBigInt(payload.schoolId),
        vanId: toBigInt(payload.vanId),
        driverCpf,
        mobile: payload.mobile ? String(payload.mobile) : null,
      },
    });
    return false;
  }

  if (entityType === "payment") {
    const id = toBigInt(payload.id);
    const studentId = toBigInt(payload.studentId);
    if (!studentId) return true;
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return true;
    if (scope.role === "DRIVER" && student.driverCpf !== scope.cpf) return true;
    if (scope.role === "GUARDIAN" && student.guardianCpf !== scope.cpf) return true;

    if (id) {
      const existing = await prisma.payment.findUnique({ where: { id } });
      if (existing && isConflict(existing.updatedAt, clientUpdatedAt)) return true;
    }

    const status = resolvePaymentStatus(payload.status);

    await prisma.payment.upsert({
      where: { id: id ?? BigInt(0) },
      update: {
        studentId,
        vanId: toBigInt(payload.vanId),
        dueDate: new Date(String(payload.dueDate)),
        paidAt: payload.paidAt ? new Date(String(payload.paidAt)) : null,
        amount: new Prisma.Decimal(Number(payload.amount ?? 0)),
        discount: new Prisma.Decimal(Number(payload.discount ?? 0)),
        status,
        deletedAt: null,
      },
      create: {
        studentId,
        vanId: toBigInt(payload.vanId),
        dueDate: new Date(String(payload.dueDate)),
        paidAt: payload.paidAt ? new Date(String(payload.paidAt)) : null,
        amount: new Prisma.Decimal(Number(payload.amount ?? 0)),
        discount: new Prisma.Decimal(Number(payload.discount ?? 0)),
        status,
      },
    });
    return false;
  }

  if (entityType === "van") {
    if (scope.role !== "DRIVER") return true;
    const plate = String(payload.plate ?? "");
    if (!plate) return true;
    const existing = await prisma.van.findUnique({ where: { plate } });
    if (existing && existing.driverCpf !== scope.cpf) return true;
    if (existing && isConflict(existing.updatedAt, clientUpdatedAt)) return true;
    await prisma.van.upsert({
      where: { plate },
      update: {
        model: String(payload.model ?? existing?.model ?? ""),
        plate,
        color: payload.color ? String(payload.color) : existing?.color,
        year: payload.year ? String(payload.year) : existing?.year,
        city: payload.city ? String(payload.city) : existing?.city,
        driverCpf: scope.cpf,
        billingDay: Number(payload.billingDay ?? existing?.billingDay ?? 5),
        monthlyFee: new Prisma.Decimal(Number(payload.monthlyFee ?? existing?.monthlyFee ?? 0)),
        deletedAt: null,
      },
      create: {
        model: String(payload.model ?? ""),
        plate,
        color: payload.color ? String(payload.color) : null,
        year: payload.year ? String(payload.year) : null,
        city: payload.city ? String(payload.city) : null,
        driverCpf: scope.cpf,
        billingDay: Number(payload.billingDay ?? 5),
        monthlyFee: new Prisma.Decimal(Number(payload.monthlyFee ?? 0)),
      },
    });
    return false;
  }

  if (entityType === "school") {
    const id = toBigInt(payload.id);
    if (!id) return true;
    const existing = await prisma.school.findUnique({ where: { id } });
    if (existing && isConflict(existing.updatedAt, clientUpdatedAt)) return true;
    await prisma.school.upsert({
      where: { id },
      update: {
        name: String(payload.name ?? existing?.name ?? ""),
        address: payload.address ? String(payload.address) : existing?.address,
        phone: payload.phone ? String(payload.phone) : existing?.phone,
        contact: payload.contact ? String(payload.contact) : existing?.contact,
        principal: payload.principal ? String(payload.principal) : existing?.principal,
        doorman: payload.doorman ? String(payload.doorman) : existing?.doorman,
        deletedAt: null,
      },
      create: {
        name: String(payload.name ?? ""),
        address: String(payload.address ?? ""),
        phone: payload.phone ? String(payload.phone) : null,
        contact: payload.contact ? String(payload.contact) : null,
        principal: payload.principal ? String(payload.principal) : null,
        doorman: payload.doorman ? String(payload.doorman) : null,
      },
    });
    return false;
  }

  return true;
}

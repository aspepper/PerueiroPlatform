import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { ensureDriverUser, ensureGuardianUser } from "@/lib/user-accounts";
import {
  normalizeCpf,
  normalizeCpfOrKeep,
  normalizeOptionalCpf,
} from "@/lib/cpf";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function emptyPayload() {
  return {
    guardians: [],
    schools: [],
    drivers: [],
    vans: [],
    students: [],
    payments: [],
  } as const;
}

function toDateOrNull(input: string | null) {
  if (!input) return null;
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function shouldInclude(updatedAt: Date, updatedSince: Date | null) {
  if (!updatedSince) return true;
  return updatedAt > updatedSince;
}

type CpfCondition = { cpf: string };

function cpfSearchConditions(rawCpf: string): CpfCondition[] {
  const trimmed = rawCpf.trim();
  if (!trimmed) return [];

  const normalized = normalizeCpf(trimmed);
  const conditions: CpfCondition[] = [{ cpf: trimmed }];

  if (normalized && normalized !== trimmed) {
    conditions.push({ cpf: normalized });
  }

  return conditions;
}

function withNormalizedCpf<T extends { cpf: string }>(record: T): T {
  const normalized = normalizeCpfOrKeep(record.cpf);
  if (normalized === record.cpf) return record;
  return { ...record, cpf: normalized };
}

function withNormalizedCpfReferences<
  T extends { guardianCpf?: string | null; driverCpf?: string | null },
>(record: T): T {
  const guardianCpf = normalizeOptionalCpf(record.guardianCpf);
  const driverCpf = normalizeOptionalCpf(record.driverCpf);

  if (guardianCpf === record.guardianCpf && driverCpf === record.driverCpf) {
    return record;
  }

  return { ...record, guardianCpf, driverCpf };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("apiKey");
  if (!key || key !== process.env.NEXTAUTH_SECRET) return unauthorized();

  const updatedSince = toDateOrNull(url.searchParams.get("updatedSince"));
  const role = url.searchParams.get("role")?.toUpperCase();
  const cpf = url.searchParams.get("cpf")?.trim();

  if (role === "DRIVER" && cpf) {
    return NextResponse.json(await pullForDriver(cpf, updatedSince));
  }

  if (role === "GUARDIAN" && cpf) {
    return NextResponse.json(await pullForGuardian(cpf, updatedSince));
  }

  const whereUpdated = updatedSince ? { updatedAt: { gt: updatedSince } } : {};

  const [guardians, schools, drivers, vans, students, payments] = await Promise.all([
    prisma.guardian.findMany({ where: whereUpdated }),
    prisma.school.findMany({ where: whereUpdated }),
    prisma.driver.findMany({ where: whereUpdated }),
    prisma.van.findMany({ where: whereUpdated }),
    prisma.student.findMany({ where: whereUpdated }),
    prisma.payment.findMany({ where: whereUpdated }),
  ]);

  return NextResponse.json({
    syncedAt: new Date().toISOString(),
    guardians: guardians.map(withNormalizedCpf),
    schools,
    drivers: drivers.map(withNormalizedCpf),
    vans,
    students: students.map(withNormalizedCpfReferences),
    payments,
  });
}

async function pullForDriver(cpf: string, updatedSince: Date | null) {
  const cpfConditions = cpfSearchConditions(cpf);
  if (cpfConditions.length === 0) return emptyPayload();

  const driver = await prisma.driver.findFirst({
    where: { OR: cpfConditions },
    include: {
      vans: true,
      students: {
        include: {
          guardian: true,
          school: true,
          van: true,
          payments: true,
        },
      },
    },
  });

  if (!driver) return emptyPayload();

  await ensureDriverUser({
    cpf: driver.cpf,
    name: driver.name,
    email: driver.email,
    userId: driver.userId,
  });

  const { vans: driverVans, students: driverStudents, ...driverRecord } = driver;

  const drivers = shouldInclude(driver.updatedAt, updatedSince)
    ? [withNormalizedCpf(driverRecord)]
    : [];
  const guardiansMap = new Map<
    string,
    {
      record: NonNullable<(typeof driverStudents)[number]["guardian"]>;
      ensure: { cpf: string; name: string; userId: string | null };
    }
  >();
  const schoolsMap = new Map<string, NonNullable<typeof driverStudents[number]["school"]>>();
  const vansMap = new Map<string, typeof driverVans[number]>();
  const students: Omit<
    (typeof driverStudents)[number],
    "guardian" | "school" | "van" | "payments"
  >[] = [];
  const paymentsMap = new Map<string, (typeof driverStudents[number]["payments"])[number]>();

  for (const van of driverVans) {
    if (shouldInclude(van.updatedAt, updatedSince)) {
      vansMap.set(van.id.toString(), van);
    }
  }

  for (const student of driverStudents) {
    const { guardian, school, van, payments, ...studentRecord } = student;
    if (shouldInclude(student.updatedAt, updatedSince)) {
      students.push(withNormalizedCpfReferences(studentRecord));
    }

    if (guardian && shouldInclude(guardian.updatedAt, updatedSince)) {
      const normalizedCpf = normalizeCpfOrKeep(guardian.cpf);
      guardiansMap.set(normalizedCpf, {
        record: { ...guardian, cpf: normalizedCpf },
        ensure: {
          cpf: guardian.cpf,
          name: guardian.name,
          userId: guardian.userId,
        },
      });
    }

    if (school && shouldInclude(school.updatedAt, updatedSince)) {
      schoolsMap.set(school.id.toString(), school);
    }

    if (van && shouldInclude(van.updatedAt, updatedSince)) {
      vansMap.set(van.id.toString(), van);
    }

    for (const payment of payments) {
      if (shouldInclude(payment.updatedAt, updatedSince)) {
        paymentsMap.set(payment.id.toString(), payment);
      }
    }
  }

  for (const { ensure } of guardiansMap.values()) {
    await ensureGuardianUser(ensure);
  }

  return {
    syncedAt: new Date().toISOString(),
    guardians: Array.from(guardiansMap.values()).map(({ record }) => record),
    schools: Array.from(schoolsMap.values()),
    drivers,
    vans: Array.from(vansMap.values()),
    students,
    payments: Array.from(paymentsMap.values()),
  };
}

async function pullForGuardian(cpf: string, updatedSince: Date | null) {
  const cpfConditions = cpfSearchConditions(cpf);
  if (cpfConditions.length === 0) return emptyPayload();

  const guardian = await prisma.guardian.findFirst({
    where: { OR: cpfConditions },
    include: {
      students: {
        include: {
          school: true,
          van: true,
          driver: true,
          payments: true,
        },
      },
    },
  });

  if (!guardian) return emptyPayload();

  await ensureGuardianUser({
    cpf: guardian.cpf,
    name: guardian.name,
    userId: guardian.userId,
  });

  const { students: guardianStudents, ...guardianRecord } = guardian;

  const guardians = shouldInclude(guardian.updatedAt, updatedSince)
    ? [withNormalizedCpf(guardianRecord)]
    : [];
  const driversMap = new Map<
    string,
    {
      record: NonNullable<(typeof guardianStudents)[number]["driver"]>;
      ensure: {
        cpf: string;
        name: string;
        email: string | null;
        userId: string | null;
      };
    }
  >();
  const vansMap = new Map<string, NonNullable<typeof guardianStudents[number]["van"]>>();
  const schoolsMap = new Map<string, NonNullable<typeof guardianStudents[number]["school"]>>();
  const students: Omit<
    (typeof guardianStudents)[number],
    "school" | "van" | "driver" | "payments"
  >[] = [];
  const paymentsMap = new Map<string, (typeof guardianStudents[number]["payments"])[number]>();

  for (const student of guardianStudents) {
    const { school, van, driver, payments, ...studentRecord } = student;

    if (shouldInclude(student.updatedAt, updatedSince)) {
      students.push(withNormalizedCpfReferences(studentRecord));
    }

    if (driver && shouldInclude(driver.updatedAt, updatedSince)) {
      const normalizedCpf = normalizeCpfOrKeep(driver.cpf);
      driversMap.set(normalizedCpf, {
        record: { ...driver, cpf: normalizedCpf },
        ensure: {
          cpf: driver.cpf,
          name: driver.name,
          email: driver.email,
          userId: driver.userId,
        },
      });
    }

    if (van && shouldInclude(van.updatedAt, updatedSince)) {
      vansMap.set(van.id.toString(), van);
    }

    if (school && shouldInclude(school.updatedAt, updatedSince)) {
      schoolsMap.set(school.id.toString(), school);
    }

    for (const payment of payments) {
      if (shouldInclude(payment.updatedAt, updatedSince)) {
        paymentsMap.set(payment.id.toString(), payment);
      }
    }
  }

  for (const { ensure } of driversMap.values()) {
    await ensureDriverUser(ensure);
  }

  return {
    syncedAt: new Date().toISOString(),
    guardians,
    schools: Array.from(schoolsMap.values()),
    drivers: Array.from(driversMap.values()).map(({ record }) => record),
    vans: Array.from(vansMap.values()),
    students,
    payments: Array.from(paymentsMap.values()),
  };
}

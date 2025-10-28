import { NextResponse } from "next/server";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ensureDriverUser, ensureGuardianUser } from "@/lib/user-accounts";
import {
  cpfSearchValues,
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
  return cpfSearchValues(rawCpf).map((cpf) => ({ cpf }));
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

const studentInclude = {
  guardian: true,
  school: true,
  van: {
    select: {
      id: true,
      model: true,
      color: true,
      year: true,
      plate: true,
      driverCpf: true,
      billingDay: true,
      monthlyFee: true,
      updatedAt: true,
    },
  },
  payments: true,
} as const;

const vanSelect = {
  id: true,
  model: true,
  color: true,
  year: true,
  plate: true,
  driverCpf: true,
  billingDay: true,
  monthlyFee: true,
  updatedAt: true,
} as const;

type VanRecord = Prisma.VanGetPayload<{ select: typeof vanSelect }>;

type VanSyncPayload = {
  id: string;
  model: string;
  color: string | null;
  year: string | null;
  plate: string;
  driverCpf: string | null;
  billingDay: number;
  monthlyFee: number;
  updatedAt: string;
};

function formatVanForSync(van: VanRecord): VanSyncPayload {
  return {
    id: van.id.toString(),
    model: van.model,
    color: van.color,
    year: van.year,
    plate: van.plate,
    driverCpf: van.driverCpf,
    billingDay: van.billingDay,
    monthlyFee: Number(van.monthlyFee),
    updatedAt: van.updatedAt.toISOString(),
  };
}

function collectVan(
  map: Map<string, VanSyncPayload>,
  van: VanRecord,
  updatedSince: Date | null,
  forceInclude = false,
) {
  if (!forceInclude && !shouldInclude(van.updatedAt, updatedSince)) {
    return;
  }

  map.set(van.id.toString(), formatVanForSync(van));
}

export async function GET(request: Request) {
  try {
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
      prisma.van.findMany({ where: whereUpdated, select: vanSelect }),
      prisma.student.findMany({ where: whereUpdated }),
      prisma.payment.findMany({ where: whereUpdated }),
    ]);

    return NextResponse.json({
      syncedAt: new Date().toISOString(),
      guardians: guardians.map(withNormalizedCpf),
      schools,
      drivers: drivers.map(withNormalizedCpf),
      vans: vans.map(formatVanForSync),
      students: students.map(withNormalizedCpfReferences),
      payments,
    });
  } catch (error) {
    console.error("Falha ao executar sincronização", error);
    return NextResponse.json(
      { error: "Não foi possível carregar a sincronização." },
      { status: 500 },
    );
  }
}

async function pullForDriver(cpf: string, updatedSince: Date | null) {
  const cpfConditions = cpfSearchConditions(cpf);
  if (cpfConditions.length === 0) return emptyPayload();

  const driver = await prisma.driver.findFirst({
    where: { OR: cpfConditions },
    include: {
      vans: { select: vanSelect },
      students: {
        include: studentInclude,
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

  const { vans: driverVans, students: directStudents, ...driverRecord } = driver;

  const additionalStudents = driverVans.length
    ? await prisma.student.findMany({
        where: { vanId: { in: driverVans.map((van) => van.id) } },
        include: studentInclude,
      })
    : [];

  const studentMap = new Map<string, (typeof directStudents)[number]>();
  for (const student of directStudents) {
    studentMap.set(student.id.toString(), student);
  }
  for (const student of additionalStudents) {
    studentMap.set(student.id.toString(), student as (typeof directStudents)[number]);
  }
  const driverStudents = Array.from(studentMap.values());

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
  const vansMap = new Map<string, VanSyncPayload>();
  const students: Omit<
    (typeof driverStudents)[number],
    "guardian" | "school" | "van" | "payments"
  >[] = [];
  const paymentsMap = new Map<string, (typeof driverStudents[number]["payments"])[number]>();

  for (const van of driverVans) {
    collectVan(vansMap, van, updatedSince);
  }

  for (const student of driverStudents) {
    const { guardian, school, van, payments, ...studentRecord } = student;
    const includeStudent = shouldInclude(student.updatedAt, updatedSince);
    if (includeStudent) {
      students.push(withNormalizedCpfReferences(studentRecord));
    }

    if (guardian) {
      const includeGuardian =
        includeStudent || shouldInclude(guardian.updatedAt, updatedSince);
      if (includeGuardian) {
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
    }

    if (school) {
      const includeSchool =
        includeStudent || shouldInclude(school.updatedAt, updatedSince);
      if (includeSchool) {
        schoolsMap.set(school.id.toString(), school);
      }
    }

    if (van) {
      collectVan(vansMap, van, updatedSince, includeStudent);
    }

    for (const payment of payments) {
      if (includeStudent || shouldInclude(payment.updatedAt, updatedSince)) {
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
          van: { select: vanSelect },
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
  const vansMap = new Map<string, VanSyncPayload>();
  const schoolsMap = new Map<string, NonNullable<typeof guardianStudents[number]["school"]>>();
  const students: Omit<
    (typeof guardianStudents)[number],
    "school" | "van" | "driver" | "payments"
  >[] = [];
  const paymentsMap = new Map<string, (typeof guardianStudents[number]["payments"])[number]>();

  for (const student of guardianStudents) {
    const { school, van, driver, payments, ...studentRecord } = student;
    const includeStudent = shouldInclude(student.updatedAt, updatedSince);

    if (includeStudent) {
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

    if (van) {
      collectVan(vansMap, van, updatedSince, includeStudent);
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

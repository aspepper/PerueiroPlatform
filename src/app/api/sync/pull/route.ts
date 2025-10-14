import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { ensureDriverUser, ensureGuardianUser } from "@/lib/user-accounts";

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

  return NextResponse.json({ guardians, schools, drivers, vans, students, payments });
}

async function pullForDriver(cpf: string, updatedSince: Date | null) {
  const driver = await prisma.driver.findUnique({
    where: { cpf },
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

  const drivers = shouldInclude(driver.updatedAt, updatedSince) ? [driverRecord] : [];
  const guardiansMap = new Map<string, NonNullable<typeof driverStudents[number]["guardian"]>>();
  const schoolsMap = new Map<string, NonNullable<typeof driverStudents[number]["school"]>>();
  const vansMap = new Map<string, typeof driverVans[number]>();
  const students: typeof driverStudents[number][] = [];
  const paymentsMap = new Map<string, (typeof driverStudents[number]["payments"])[number]>();

  for (const van of driverVans) {
    if (shouldInclude(van.updatedAt, updatedSince)) {
      vansMap.set(van.id.toString(), van);
    }
  }

  for (const student of driverStudents) {
    const { guardian, school, van, payments, ...studentRecord } = student;
    if (shouldInclude(student.updatedAt, updatedSince)) {
      students.push(studentRecord);
    }

    if (guardian && shouldInclude(guardian.updatedAt, updatedSince)) {
      guardiansMap.set(guardian.cpf, guardian);
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

  for (const guardian of guardiansMap.values()) {
    await ensureGuardianUser({
      cpf: guardian.cpf,
      name: guardian.name,
      userId: guardian.userId,
    });
  }

  return {
    guardians: Array.from(guardiansMap.values()),
    schools: Array.from(schoolsMap.values()),
    drivers,
    vans: Array.from(vansMap.values()),
    students,
    payments: Array.from(paymentsMap.values()),
  };
}

async function pullForGuardian(cpf: string, updatedSince: Date | null) {
  const guardian = await prisma.guardian.findUnique({
    where: { cpf },
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

  const guardians = shouldInclude(guardian.updatedAt, updatedSince) ? [guardianRecord] : [];
  const driversMap = new Map<string, NonNullable<typeof guardianStudents[number]["driver"]>>();
  const vansMap = new Map<string, NonNullable<typeof guardianStudents[number]["van"]>>();
  const schoolsMap = new Map<string, NonNullable<typeof guardianStudents[number]["school"]>>();
  const students: typeof guardianStudents[number][] = [];
  const paymentsMap = new Map<string, (typeof guardianStudents[number]["payments"])[number]>();

  for (const student of guardianStudents) {
    const { school, van, driver, payments, ...studentRecord } = student;

    if (shouldInclude(student.updatedAt, updatedSince)) {
      students.push(studentRecord);
    }

    if (driver && shouldInclude(driver.updatedAt, updatedSince)) {
      driversMap.set(driver.cpf, driver);
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

  for (const driver of driversMap.values()) {
    await ensureDriverUser({
      cpf: driver.cpf,
      name: driver.name,
      email: driver.email,
      userId: driver.userId,
    });
  }

  return {
    guardians,
    schools: Array.from(schoolsMap.values()),
    drivers: Array.from(driversMap.values()),
    vans: Array.from(vansMap.values()),
    students,
    payments: Array.from(paymentsMap.values()),
  };
}

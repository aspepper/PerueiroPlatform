import { prisma } from "@/lib/prisma";
import { ensureDriverUser, ensureGuardianUser } from "@/lib/user-accounts";
import { NextResponse } from "next/server";

function requireApiKey(request: Request) {
  const key = request.headers.get("x-api-key");
  if (!key || key !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(request: Request) {
  const unauthorized = requireApiKey(request);
  if (unauthorized) return unauthorized;

  const payload = await request.json();
  const upserts = [] as Promise<any>[];

  if (Array.isArray(payload.guardians)) {
    for (const g of payload.guardians) {
      upserts.push((async () => {
        const guardian = await prisma.guardian.upsert({
          where: { cpf: g.cpf },
          update: g,
          create: g,
          select: {
            cpf: true,
            name: true,
            userId: true,
          },
        });
        await ensureGuardianUser({
          cpf: guardian.cpf,
          name: guardian.name,
          userId: guardian.userId,
        });
      })());
    }
  }
  if (Array.isArray(payload.schools)) {
    for (const s of payload.schools) {
      upserts.push(prisma.school.upsert({
        where: { id: BigInt(s.id ?? 0) },
        update: { name: s.name, address: s.address, phone: s.phone, contact: s.contact, principal: s.principal, doorman: s.doorman },
        create: { name: s.name, address: s.address, phone: s.phone, contact: s.contact, principal: s.principal, doorman: s.doorman },
      }));
    }
  }
  if (Array.isArray(payload.drivers)) {
    for (const d of payload.drivers) {
      upserts.push((async () => {
        const driver = await prisma.driver.upsert({
          where: { cpf: d.cpf },
          update: d,
          create: d,
          select: {
            cpf: true,
            name: true,
            email: true,
            userId: true,
          },
        });
        await ensureDriverUser({
          cpf: driver.cpf,
          name: driver.name,
          email: driver.email,
          userId: driver.userId,
        });
      })());
    }
  }
  if (Array.isArray(payload.vans)) {
    for (const v of payload.vans) {
      const billingDay = Number.parseInt(String(v.billingDay ?? 10), 10);
      const monthlyFee = Number(v.monthlyFee ?? 0);
      upserts.push(prisma.van.upsert({
        where: { plate: v.plate },
        update: {
          model: v.model,
          plate: v.plate,
          color: v.color,
          year: v.year,
          driverCpf: v.driverCpf,
          billingDay: Number.isNaN(billingDay) ? 10 : billingDay,
          monthlyFee,
        },
        create: {
          model: v.model,
          plate: v.plate,
          color: v.color,
          year: v.year,
          driverCpf: v.driverCpf,
          billingDay: Number.isNaN(billingDay) ? 10 : billingDay,
          monthlyFee,
        },
      }));
    }
  }
  if (Array.isArray(payload.students)) {
    for (const st of payload.students) {
      upserts.push(prisma.student.upsert({
        where: { id: BigInt(st.id ?? 0) },
        update: { name: st.name, birthDate: st.birthDate ? new Date(st.birthDate) : null, grade: st.grade, guardianCpf: st.guardianCpf, schoolId: st.schoolId ? BigInt(st.schoolId) : null, vanId: st.vanId ? BigInt(st.vanId) : null, driverCpf: st.driverCpf, mobile: st.mobile, blacklist: !!st.blacklist },
        create: { name: st.name, birthDate: st.birthDate ? new Date(st.birthDate) : null, grade: st.grade, guardianCpf: st.guardianCpf, schoolId: st.schoolId ? BigInt(st.schoolId) : null, vanId: st.vanId ? BigInt(st.vanId) : null, driverCpf: st.driverCpf, mobile: st.mobile, blacklist: !!st.blacklist },
      }));
    }
  }
  if (Array.isArray(payload.payments)) {
    for (const p of payload.payments) {
      upserts.push(prisma.payment.upsert({
        where: { id: BigInt(p.id ?? 0) },
        update: {
          studentId: BigInt(p.studentId),
          vanId: p.vanId ? BigInt(p.vanId) : null,
          dueDate: new Date(p.dueDate),
          paidAt: p.paidAt ? new Date(p.paidAt) : null,
          amount: p.amount,
          discount: p.discount ?? 0,
          status: p.status ?? "PENDING",
          boletoId: p.boletoId ?? null,
        },
        create: {
          studentId: BigInt(p.studentId),
          vanId: p.vanId ? BigInt(p.vanId) : null,
          dueDate: new Date(p.dueDate),
          paidAt: p.paidAt ? new Date(p.paidAt) : null,
          amount: p.amount,
          discount: p.discount ?? 0,
          status: p.status ?? "PENDING",
          boletoId: p.boletoId ?? null,
        },
      }));
    }
  }

  await Promise.all(upserts);
  return NextResponse.json({ ok: true, counts: {
    guardians: payload.guardians?.length || 0,
    schools: payload.schools?.length || 0,
    drivers: payload.drivers?.length || 0,
    vans: payload.vans?.length || 0,
    students: payload.students?.length || 0,
    payments: payload.payments?.length || 0,
  }});
}

import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

function unauthorized() { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("apiKey");
  if (!key || key !== process.env.NEXTAUTH_SECRET) return unauthorized();

  const updatedSinceParam = new URL(request.url).searchParams.get("updatedSince");
  const updatedSince = updatedSinceParam ? new Date(updatedSinceParam) : null;

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

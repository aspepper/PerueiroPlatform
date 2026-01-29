import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyMobileToken } from "@/lib/mobile-jwt";

export type SyncScope =
  | { role: "DRIVER"; cpf: string; userId: string }
  | { role: "GUARDIAN"; cpf: string; userId: string };

export async function requireMobileJwt(request: Request) {
  const payload = await verifyMobileToken(request);
  if (!payload) {
    return {
      unauthorized: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      payload: null,
    };
  }
  return { unauthorized: null, payload };
}

export async function resolveSyncScope(payload: {
  userId: string;
  role: "DRIVER" | "GUARDIAN";
  cpf: string;
}): Promise<SyncScope | null> {
  if (payload.role === "DRIVER") {
    const driver = await prisma.driver.findFirst({
      where: { userId: payload.userId, deletedAt: null },
    });
    return driver ? { role: "DRIVER", cpf: driver.cpf, userId: payload.userId } : null;
  }

  const guardian = await prisma.guardian.findFirst({
    where: { userId: payload.userId, deletedAt: null },
  });
  return guardian ? { role: "GUARDIAN", cpf: guardian.cpf, userId: payload.userId } : null;
}

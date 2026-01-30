import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePasswordHash } from "@/lib/password";
import { PASSWORD_RESET_TOKEN_SELECT } from "@/lib/prisma-selects";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Dados inválidos" }, { status: 400 });
  }

  const { token, password } = parsed.data;

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    select: PASSWORD_RESET_TOKEN_SELECT,
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return NextResponse.json(
      { message: "Token inválido ou expirado." },
      { status: 400 },
    );
  }

  const passwordHash = await resolvePasswordHash(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        password: passwordHash,
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ message: "Senha atualizada com sucesso." });
}

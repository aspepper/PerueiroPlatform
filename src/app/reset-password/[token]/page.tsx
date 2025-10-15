import LogoPerueiro from "@/components/logo-perueiro";
import ResetPasswordForm from "./reset-password-form";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

export const metadata = { title: "Redefinir senha • Perueiro Admin" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = params;
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  const isExpired = !resetToken || resetToken.expiresAt < new Date();
  const alreadyUsed = Boolean(resetToken?.usedAt);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#F5F7FB] text-slate-900">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#FFD54F]" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-[420px] w-[420px] rounded-full bg-[#00D2D3] opacity-90" />

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-10 shadow-[0_8px_24px_rgba(11,16,32,0.12)]">
          <div className="flex items-start gap-8">
            <LogoPerueiro className="h-28 w-28 shrink-0" />
            <div>
              <p className="mb-1 text-[16px] font-extrabold text-[#0F1730]">Perueiro Admin</p>
              <h1 className="mb-3 text-[40px] font-extrabold leading-tight text-[#0F1730]">
                Defina uma nova senha com segurança.
              </h1>
              <p className="text-[16px] leading-relaxed text-[#6B7280]">
                Crie uma senha forte para continuar administrando rotas, motoristas e alunos com tranquilidade.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-8 shadow-[0_8px_24px_rgba(11,16,32,0.12)]">
          {isExpired || alreadyUsed ? (
            <div className="space-y-4 text-center">
              <h2 className="text-[28px] font-extrabold text-[#0F1730]">Link indisponível</h2>
              <p className="text-[15px] text-[#6B7280]">
                Este link de redefinição de senha já foi utilizado ou expirou. Solicite um novo link para continuar.
              </p>
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center rounded-[14px] bg-[#0F1730] px-6 py-3 text-[15px] font-extrabold text-white transition hover:brightness-110"
              >
                Solicitar novo link
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-1 text-[28px] font-extrabold text-[#0F1730]">Criar nova senha</h2>
              <p className="mb-6 text-[15px] text-[#6B7280]">Digite e confirme uma nova senha para concluir o processo.</p>
              <ResetPasswordForm token={token} />
            </>
          )}
        </section>
      </div>

      <p className="pb-8 text-center text-[12px] text-[#64748B]">© {new Date().getFullYear()} Perueiro. Todos os direitos reservados.</p>
    </main>
  );
}

import LogoPerueiro from "@/components/logo-perueiro";
import ForgotPasswordForm from "./forgot-password-form";

export const metadata = { title: "Esqueci minha senha • Perueiro Admin" };
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#F5F7FB] text-slate-900">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#FFD54F]" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-[420px] w-[420px] rounded-full bg-[#00D2D3] opacity-90" />

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-10 shadow-[0_8px_24px_rgba(11,16,32,0.12)]">
          <div className="flex items-start gap-8">
            <LogoPerueiro className="h-28 w-28 shrink-0" />
            <div>
              <p className="mb-1 text-[16px] font-extrabold text-[#0F1730]">Esqueceu sua senha?</p>
              <h1 className="mb-3 text-[40px] font-extrabold leading-tight text-[#0F1730]">
                Tudo bem, vamos te ajudar.
              </h1>
              <p className="text-[16px] leading-relaxed text-[#6B7280]">
                Informe o e-mail cadastrado que enviaremos um link para você criar uma nova senha e voltar a acessar o painel
                administrativo.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-8 shadow-[0_8px_24px_rgba(11,16,32,0.12)]">
          <h2 className="mb-1 text-[28px] font-extrabold text-[#0F1730]">Enviar link de redefinição</h2>
          <p className="mb-6 text-[15px] text-[#6B7280]">
            Você receberá um e-mail com instruções válidas por 1 hora.
          </p>

          <ForgotPasswordForm />
        </section>
      </div>

      <p className="pb-8 text-center text-[12px] text-[#64748B]">© {new Date().getFullYear()} Perueiro. Todos os direitos reservados.</p>
    </main>
  );
}

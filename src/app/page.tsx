import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const steps: { title: string; description: ReactNode }[] = [
  {
    title: "1. Cadastro",
    description: (
      <>
        Registre seus <strong>responsáveis</strong> e <strong>alunos</strong>, defina rotas e pontos de
        embarque.
      </>
    ),
  },
  {
    title: "2. Cobrança",
    description: (
      <>
        Controle pagamentos, gere recibos e marque inadimplentes na <strong>lista negra</strong>.
      </>
    ),
  },
  {
    title: "3. Acompanhamento",
    description: (
      <>
        Pais acompanham a van <strong>ao vivo no mapa</strong> pelo app, com alertas de chegada.
      </>
    ),
  },
];

const driverFeatures = [
  "Cadastro de clientes (pais) e alunos",
  "Lista negra de clientes com motivo e período",
  "Controle de pagamentos por aluno",
  "Rotas, horários e capacidade de vans",
  "Envio de lembrete por WhatsApp e e-mail",
];

const guardianFeatures = [
  "Acompanhamento em tempo real no mapa",
  "Notificações de saída/chegada",
  "Histórico de pagamentos e recibos",
  "Comunicação rápida com o motorista",
];

const plans = [
  {
    name: "Iniciante",
    description: "Até 10 alunos",
    price: "R$ 0",
    detail: "Teste gratuito",
    featured: false,
  },
  {
    name: "Profissional",
    description: "Até 60 alunos",
    price: "R$ 49/mês",
    detail: "Tudo do iniciante + cobranças",
    featured: true,
  },
  {
    name: "Frota",
    description: "Várias vans",
    price: "Sob consulta",
    detail: "Relatórios e múltiplos usuários",
    featured: false,
  },
];

const faqs = [
  {
    question: "Os pais precisam criar conta?",
    answer:
      "Não. Eles recebem convite do motorista e acessam o app para ver a rota e pagamentos.",
  },
  {
    question: "Como funciona a localização em tempo real?",
    answer:
      "O app do motorista envia a posição durante o percurso, com privacidade e controle de horário.",
  },
  {
    question: "Há emissão de recibos?",
    answer:
      "Sim. Cada pagamento fica registrado por aluno, com recibo para o responsável.",
  },
];

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role === "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <main className="bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/landing/logo.svg"
              alt="Perueiros"
              width={36}
              height={36}
              className="h-9 w-auto"
              priority
            />
            <span className="font-semibold tracking-tight">Perueiros</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#como-funciona" className="transition-colors hover:text-sky-600">
              Como funciona
            </a>
            <a href="#recursos" className="transition-colors hover:text-sky-600">
              Recursos
            </a>
            <a href="#planos" className="transition-colors hover:text-sky-600">
              Planos
            </a>
            <a href="#faq" className="transition-colors hover:text-sky-600">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <a
              href="#app"
              className="rounded-xl border border-slate-300 px-4 py-2 transition-colors hover:bg-slate-100"
            >
              Baixar app
            </a>
            <a
              href="https://api.whatsapp.com/send?phone=+5511999999999"
              className="rounded-xl bg-gradient-to-tr from-emerald-600 to-sky-500 px-4 py-2 text-white shadow"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Controle total da sua van escolar — simples, seguro e em tempo real
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Cadastre alunos e responsáveis, gerencie pagamentos, mantenha a lista negra organizada e
              compartilhe sua <span className="font-semibold text-sky-700">localização ao vivo</span> com os pais.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#app"
                className="rounded-xl bg-gradient-to-tr from-emerald-600 to-sky-500 px-5 py-3 text-white shadow-lg shadow-sky-200"
              >
                Baixar aplicativo
              </a>
              <a
                href="#recursos"
                className="rounded-xl border border-slate-300 px-5 py-3 transition-colors hover:bg-slate-100"
              >
                Ver recursos
              </a>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 text-center text-sm sm:grid-cols-3">
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="text-2xl font-bold">Tempo real</div>
                <p className="text-slate-500">Mapa para os pais</p>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="text-2xl font-bold">Pagamentos</div>
                <p className="text-slate-500">Cobrança simplificada</p>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="text-2xl font-bold">Lista negra</div>
                <p className="text-slate-500">Evite inadimplência</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <Image
              src="/landing/hero-map.svg"
              alt="Mapa com posição em tempo real"
              width={900}
              height={560}
              className="rounded-2xl border border-slate-200 shadow-xl"
              priority
            />
            <div className="absolute -bottom-6 -left-6 rounded-2xl border border-white/50 bg-white/70 p-4 shadow-lg backdrop-blur">
              <p className="text-xs text-slate-600">
                Status: <span className="font-semibold text-emerald-600">Em rota</span>
              </p>
              <p className="text-xs text-slate-600">Próxima parada: Colégio Central</p>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Como funciona</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title} className="rounded-2xl border bg-slate-50 p-6">
                <div className="font-semibold text-sky-600">{step.title}</div>
                <p className="mt-2 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="recursos" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Feito para motoristas e famílias</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-white p-6">
              <h3 className="font-semibold text-slate-800">Para o Perueiro</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
                {driverFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border bg-white p-6">
              <h3 className="font-semibold text-slate-800">Para os Pais</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
                {guardianFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="planos" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Planos simples</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 ${
                  plan.featured ? "border-2 border-sky-500 bg-white shadow-sm" : "bg-slate-50"
                }`}
              >
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="mt-1 text-slate-600">{plan.description}</p>
                <div className="mt-4 text-3xl font-bold">{plan.price}</div>
                <p className="text-sm text-slate-500">{plan.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <a
              href="#app"
              className="inline-flex rounded-xl bg-gradient-to-tr from-emerald-600 to-sky-500 px-6 py-3 text-white shadow"
            >
              Começar agora
            </a>
          </div>
        </div>
      </section>

      <section id="faq" className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Perguntas frequentes</h2>
          <div className="mt-8 divide-y divide-slate-200">
            {faqs.map((faq) => (
              <details key={faq.question} className="py-4">
                <summary className="cursor-pointer font-medium">{faq.question}</summary>
                <p className="mt-2 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="app" className="bg-gradient-to-r from-sky-50 via-white to-sky-50 py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Pronto para oferecer transparência aos responsáveis?
          </h2>
          <p className="text-slate-600">
            Baixe o app do motorista, convide responsáveis e compartilhe a rota em tempo real com quem
            confia no seu trabalho todos os dias.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#"
              className="rounded-xl border border-slate-300 px-5 py-3 text-slate-700 transition-colors hover:bg-slate-100"
            >
              Baixar para Android
            </a>
            <a
              href="#"
              className="rounded-xl border border-slate-300 px-5 py-3 text-slate-700 transition-colors hover:bg-slate-100"
            >
              Baixar para iOS
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/landing/logo.svg"
                alt="Perueiros"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="font-semibold">Perueiros</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              App para vans escolares: organização, segurança e transparência para todos.
            </p>
          </div>
          <div className="text-sm">
            <div className="font-semibold">Links</div>
            <ul className="mt-2 space-y-1">
              <li>
                <a href="#como-funciona" className="transition-colors hover:text-sky-600">
                  Como funciona
                </a>
              </li>
              <li>
                <a href="#recursos" className="transition-colors hover:text-sky-600">
                  Recursos
                </a>
              </li>
              <li>
                <a href="#planos" className="transition-colors hover:text-sky-600">
                  Planos
                </a>
              </li>
              <li>
                <a href="#faq" className="transition-colors hover:text-sky-600">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div className="text-sm">
            <div className="font-semibold">Contato</div>
            <ul className="mt-2 space-y-1">
              <li>Email: contato@perueiros.app</li>
              <li>WhatsApp: (11) 99999-9999</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 pb-10 text-xs text-slate-500 sm:px-6 lg:px-8">
          <p>© Perueiros — todos os direitos reservados.</p>
          <Link href="/login" className="text-slate-400 transition-colors hover:text-slate-600">
            Admin
          </Link>
        </div>
      </footer>
    </main>
  );
}

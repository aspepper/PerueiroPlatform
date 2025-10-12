import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    title: "Monitoramento em tempo real",
    description:
      "Acompanhe motoristas, vans e alunos em um único painel intuitivo, com atualizações instantâneas de rota.",
  },
  {
    title: "Financeiro integrado",
    description:
      "Gere boletos, acompanhe pagamentos e reduza inadimplência com lembretes automáticos para responsáveis.",
  },
  {
    title: "Comunicação centralizada",
    description:
      "Envie avisos e colete confirmações das famílias com apenas alguns cliques, direto do painel web ou app.",
  },
];

const steps = [
  {
    number: "1",
    title: "Cadastre seu time",
    description: "Inclua motoristas, veículos e turmas em poucos minutos para começar o acompanhamento.",
  },
  {
    number: "2",
    title: "Sincronize com o app",
    description: "Integre automaticamente com o aplicativo móvel para manter dados e rotas sempre atualizados.",
  },
  {
    number: "3",
    title: "Acompanhe tudo",
    description: "Visualize indicadores, pagamentos e ocorrências em tempo real com alertas inteligentes.",
  },
];

const testimonials = [
  {
    quote:
      "Conseguimos substituir dezenas de planilhas por um painel único. Hoje temos visibilidade total das rotas e dos pagamentos.",
    author: "Patrícia Andrade",
    role: "Gestora de transporte escolar em Belo Horizonte",
  },
  {
    quote: "Os responsáveis sentem-se mais tranquilos recebendo atualizações em tempo real. A comunicação ficou muito mais humana.",
    author: "Rafael Lima",
    role: "Coordenador logístico em São Paulo",
  },
];

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Perueiros • Plataforma completa para transporte escolar</title>
        <meta
          name="description"
          content="Gerencie rotas, motoristas, alunos e pagamentos dos perueiros em um único lugar, com relatórios e integrações."
        />
      </Head>

      <main className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <header className="relative overflow-hidden bg-white/90">
          <div className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-gradient-to-bl from-primary-100 to-slate-100" aria-hidden="true" />
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 text-sm font-semibold text-primary-600">
                <Image src="/perueiro-logo.svg" alt="Logotipo Perueiros" width={40} height={53} priority />
                <span>Gestão moderna para transporte escolar</span>
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Organize rotas, pagamentos e comunicação com carinho em cada detalhe.
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                O Perueiros une responsáveis, motoristas e escolas em uma plataforma segura e centralizada. Visualize o que
                importa, antecipe pendências e ofereça tranquilidade às famílias.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  Acessar painel do administrador
                </Link>
                <a
                  href="mailto:contato@perueiros.com"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  Falar com o time comercial
                </a>
              </div>
            </div>

            <div className="flex-1">
              <div className="relative mx-auto max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-primary-100/60">
                <div className="rounded-2xl bg-slate-900 p-6 text-white">
                  <p className="text-sm uppercase tracking-[0.2em] text-primary-200">Painel unificado</p>
                  <p className="mt-3 text-3xl font-semibold leading-snug">
                    Visibilidade completa das rotas e dos responsáveis, em tempo real.
                  </p>
                  <p className="mt-4 text-sm text-slate-300">
                    Relatórios instantâneos, status de pagamentos e alertas enviados automaticamente para as famílias.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-4 text-left text-slate-900">
                    <div className="rounded-xl bg-white/90 p-4">
                      <p className="text-2xl font-bold text-primary-600">128</p>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Motoristas ativos</p>
                    </div>
                    <div className="rounded-xl bg-white/90 p-4">
                      <p className="text-2xl font-bold text-primary-600">1420</p>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Alunos monitorados</p>
                    </div>
                    <div className="rounded-xl bg-white/90 p-4">
                      <p className="text-2xl font-bold text-primary-600">37</p>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pagamentos pendentes</p>
                    </div>
                    <div className="rounded-xl bg-white/90 p-4">
                      <p className="text-2xl font-bold text-primary-600">08</p>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Ocorrências resolvidas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <h2 className="text-center text-3xl font-semibold text-slate-900 sm:text-4xl">Tudo o que você precisa em um lugar só</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-slate-600">
            Um ecossistema pensado para empresas de transporte escolar que desejam profissionalizar operações e elevar a
            confiança dos responsáveis.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm leading-6 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 lg:flex-row lg:items-center">
            <div className="flex-1">
              <span className="text-sm font-semibold uppercase tracking-wide text-primary-600">Como funciona</span>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Configure em poucos passos</h2>
              <p className="mt-4 text-base text-slate-600">
                O Perueiros foi pensado para se adaptar ao seu fluxo de trabalho. Em questão de minutos seu time está pronto
                para colaborar com dados sincronizados entre web e mobile.
              </p>
            </div>
            <ol className="flex-1 space-y-6">
              {steps.map((step) => (
                <li key={step.number} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                  <span className="mt-1 h-8 w-8 flex-shrink-0 rounded-full bg-primary-600 text-center text-sm font-semibold leading-8 text-white">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 p-10 text-white shadow-lg">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
              <div className="flex-1">
                <h2 className="text-3xl font-semibold sm:text-4xl">Humanize cada trajeto com tecnologia.</h2>
                <p className="mt-4 text-base text-primary-50">
                  Recursos pensados para trazer previsibilidade, confiança e carinho a todas as famílias atendidas. Monitoramento
                  completo, notificações inteligentes e dados centralizados em uma única solução.
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-4 rounded-2xl bg-white/10 p-6">
                {testimonials.map((testimonial) => (
                  <blockquote key={testimonial.author} className="flex flex-col gap-2">
                    <p className="text-sm italic text-primary-50">“{testimonial.quote}”</p>
                    <cite className="text-xs font-medium uppercase tracking-wide text-primary-200">
                      {testimonial.author} — {testimonial.role}
                    </cite>
                  </blockquote>
                ))}
              </div>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
              >
                Entrar como administrador
              </Link>
              <a
                href="https://wa.me/5531999999999"
                className="inline-flex items-center justify-center rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Solicitar demonstração
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-slate-600">
            <Image src="/perueiro-logo.svg" alt="Perueiros" width={28} height={37} />
            <span>Perueiros © {new Date().getFullYear()}</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/login" className="hover:text-primary-600">
              Acesso do administrador
            </Link>
            <a href="mailto:contato@perueiros.com" className="hover:text-primary-600">
              contato@perueiros.com
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type ContractPageProps = {
  params: { id: string };
};

export default async function ContractPage({ params }: ContractPageProps) {
  const idRaw = params.id?.trim();
  if (!idRaw || !/^\d+$/.test(idRaw)) return notFound();

  const contractId = BigInt(idRaw);
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      student: true,
      guardian: true,
      van: true,
    },
  });

  if (!contract) return notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Contrato de Transporte Escolar</h1>
        <p className="text-sm text-slate-600">
          {contract.signed
            ? "Contrato já assinado. Você pode baixar o documento assinado."
            : "Assine digitalmente com gov.br ou envie o contrato assinado manualmente."}
        </p>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3 text-sm text-slate-700">
          <div>Aluno: {contract.student.name}</div>
          <div>Responsável: {contract.guardian.name}</div>
          <div>Van: {contract.van.plate}</div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          {contract.pdfUrl ? (
            <a
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              href={contract.pdfUrl}
              target="_blank"
              rel="noreferrer"
            >
              Baixar contrato
            </a>
          ) : (
            <p className="text-sm text-slate-600">Contrato em geração. Tente novamente mais tarde.</p>
          )}

          {contract.signedPdfUrl && (
            <a
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
              href={contract.signedPdfUrl}
              target="_blank"
              rel="noreferrer"
            >
              Baixar contrato assinado
            </a>
          )}

          <form
            action="/api/contracts/upload"
            method="post"
            encType="multipart/form-data"
            className="flex flex-col gap-3"
          >
            <input type="hidden" name="contractId" value={contract.id.toString()} />
            <label className="text-sm font-medium text-slate-700">
              CPF do responsável:
            </label>
            <input
              name="guardianCpf"
              type="text"
              defaultValue={contract.guardianCpf}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <label className="text-sm font-medium text-slate-700">
              Enviar contrato assinado (PDF ou imagem):
            </label>
            <input
              name="file"
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              required
              className="text-sm"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              Enviar assinado
            </button>
          </form>

          <form action="/api/contracts/sign-digital" method="post" className="flex flex-col gap-3">
            <input type="hidden" name="contractId" value={contract.id.toString()} />
            <input type="hidden" name="guardianCpf" value={contract.guardianCpf} />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Assinar com gov.br (em breve)
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

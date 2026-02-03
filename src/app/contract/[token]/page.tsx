import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { isTokenExpired } from "@/lib/auth/token";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type ContractPageProps = {
  params: { token: string };
};

export default async function ContractPage({ params }: ContractPageProps) {
  const token = params.token?.trim();
  if (!token) return notFound();

  const contract = await prisma.contract.findUnique({ where: { token } });
  if (!contract) return notFound();

  const expired = isTokenExpired(contract.tokenExpiry);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Contrato de Transporte Escolar</h1>
        <p className="text-sm text-slate-600">
          {expired
            ? "Este link expirou. Solicite um novo contrato ao motorista."
            : "Revise o contrato, assine e envie o documento assinado."}
        </p>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <a
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            href={contract.pdfUrl}
            target="_blank"
            rel="noreferrer"
          >
            Baixar contrato
          </a>

          <form
            action="/api/contracts/upload"
            method="post"
            encType="multipart/form-data"
            className="flex flex-col gap-3"
          >
            <input type="hidden" name="token" value={contract.token} />
            <input type="hidden" name="parentId" value={contract.parentId} />
            <label className="text-sm font-medium text-slate-700">
              Enviar contrato assinado (PDF ou imagem):
            </label>
            <input
              name="file"
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              required
              className="text-sm"
              disabled={expired}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-50"
              disabled={expired}
            >
              Enviar assinado
            </button>
          </form>

          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
            Assinar com gov.br (em breve)
          </div>
        </div>
      </section>
    </div>
  );
}

import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { differenceInCalendarMonths, format } from "date-fns";

export type ContractPdfData = {
  student: {
    name: string;
    birthDate?: Date | null;
    grade?: string | null;
    period?: string | null;
  };
  guardians: Array<{
    name: string;
    cpf: string;
    rg?: string | null;
    kinship?: string | null;
    address?: string | null;
    mobile?: string | null;
  }>;
  school?: { name?: string | null } | null;
  van: {
    monthlyFee: number;
  };
  driver?: { name?: string | null } | null;
  contract: {
    startDate: Date;
    endDate: Date;
    billingDay: number;
    rescissionFine: number;
    forumCity: string;
    signedAt?: Date | null;
    period: string;
  };
};

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "docs",
  "Contrato_Perueiros_Clientes.txt",
);

const PAGE_MARGIN = 40;
const LINE_HEIGHT = 14;
const FONT_SIZE = 10;
const MAX_LINE_LENGTH = 100;

const preferredKinships = ["pai", "mãe", "responsável legal", "avó", "avô"];

const formatDate = (value?: Date | null) => {
  if (!value) return "";
  return format(value, "dd/MM/yyyy");
};

const monthNames = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const toMonthName = (value: Date) => monthNames[value.getMonth()] ?? "";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const numberToWordsPt = (value: number) => {
  const units = [
    "zero",
    "um",
    "dois",
    "três",
    "quatro",
    "cinco",
    "seis",
    "sete",
    "oito",
    "nove",
    "dez",
    "onze",
    "doze",
    "treze",
    "quatorze",
    "quinze",
    "dezesseis",
    "dezessete",
    "dezoito",
    "dezenove",
  ];
  const tens = [
    "",
    "dez",
    "vinte",
    "trinta",
    "quarenta",
    "cinquenta",
    "sessenta",
    "setenta",
    "oitenta",
    "noventa",
  ];
  const hundreds = [
    "",
    "cento",
    "duzentos",
    "trezentos",
    "quatrocentos",
    "quinhentos",
    "seiscentos",
    "setecentos",
    "oitocentos",
    "novecentos",
  ];

  if (value === 0) return "zero";
  if (value === 100) return "cem";

  const parts: string[] = [];

  const pushChunk = (n: number) => {
    if (n === 0) return;
    if (n < 20) {
      parts.push(units[n]);
      return;
    }
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    if (hundred) {
      parts.push(hundreds[hundred]);
    }
    if (rest) {
      if (rest < 20) {
        parts.push(units[rest]);
      } else {
        const ten = Math.floor(rest / 10);
        const unit = rest % 10;
        parts.push(tens[ten]);
        if (unit) parts.push(units[unit]);
      }
    }
  };

  const millions = Math.floor(value / 1_000_000);
  const thousands = Math.floor((value % 1_000_000) / 1000);
  const remainder = value % 1000;

  if (millions) {
    pushChunk(millions);
    parts.push(millions === 1 ? "milhão" : "milhões");
  }
  if (thousands) {
    if (thousands === 1) {
      parts.push("mil");
    } else {
      pushChunk(thousands);
      parts.push("mil");
    }
  }
  pushChunk(remainder);

  return parts.join(" e ").replace(/\s+e\s+e/g, " e ");
};

const currencyToWordsPt = (value: number) => {
  const rounded = Math.round(value * 100);
  const reais = Math.floor(rounded / 100);
  const cents = rounded % 100;

  const reaisWords = `${numberToWordsPt(reais)} ${reais === 1 ? "real" : "reais"}`;
  if (!cents) return reaisWords;

  const centsWords = `${numberToWordsPt(cents)} ${cents === 1 ? "centavo" : "centavos"}`;
  return `${reaisWords} e ${centsWords}`;
};

const pickGuardianByKinship = (
  guardians: ContractPdfData["guardians"],
  kinship: string,
) =>
  guardians.find(
    (guardian) =>
      guardian.kinship?.trim().toLowerCase() === kinship.toLowerCase(),
  ) ?? null;

const pickPrimaryGuardian = (guardians: ContractPdfData["guardians"]) => {
  for (const kinship of preferredKinships) {
    const found = pickGuardianByKinship(guardians, kinship);
    if (found) return found;
  }
  return guardians[0] ?? null;
};

const wrapLine = (line: string) => {
  if (line.length <= MAX_LINE_LENGTH) return [line];

  const indentMatch = line.match(/^(\s*)/);
  const indent = indentMatch?.[1] ?? "";
  const words = line.trim().split(/\s+/);
  const lines: string[] = [];
  let current = indent;

  for (const word of words) {
    const tentative = current.trim().length === 0 ? `${indent}${word}` : `${current} ${word}`;
    if (tentative.length > MAX_LINE_LENGTH) {
      lines.push(current);
      current = `${indent}${word}`;
    } else {
      current = tentative;
    }
  }
  if (current.trim().length > 0) lines.push(current);

  return lines;
};

const fillTemplate = (template: string, replacements: Record<string, string>) => {
  let output = template;
  for (const [key, value] of Object.entries(replacements)) {
    output = output.split(key).join(value);
  }
  return output;
};

export async function generateContractPdf(data: ContractPdfData) {
  const template = await fs.readFile(TEMPLATE_PATH, "utf-8");

  const primaryGuardian = pickPrimaryGuardian(data.guardians);
  const motherGuardian =
    pickGuardianByKinship(data.guardians, "mãe") &&
    pickGuardianByKinship(data.guardians, "mãe")?.cpf !== primaryGuardian?.cpf
      ? pickGuardianByKinship(data.guardians, "mãe")
      : null;

  const contractMonths = Math.max(
    1,
    differenceInCalendarMonths(data.contract.endDate, data.contract.startDate) + 1,
  );
  const totalFee = data.van.monthlyFee * contractMonths;

  const contractStartMonth = toMonthName(data.contract.startDate);
  const contractStartYear = format(data.contract.startDate, "yyyy");
  const signDate = data.contract.signedAt ?? new Date();

  const replacements = {
    "<Student.name>": data.student.name,
    "<Student.birthdate>": formatDate(data.student.birthDate),
    "<Guardian.name when Guardian.kinship == \"Pai\" or if Student didn't another assigned Guardian registred kinship == \"Pai\", use \"Mãe\" or \"Responsável Legal\" or \"Avó\" or \"Avó\" in this order by.>":
      primaryGuardian?.name ?? "",
    "<Guardian.rg>": primaryGuardian?.rg ?? "",
    "<Guardian.cpf>": primaryGuardian?.cpf ?? "",
    "<Guardian.name when Guardian.kinship == \"Mãe\", if this already used in PAI field above>":
      motherGuardian?.name ?? "",
    "<Guardian.rg when Guardian.kinship == \"Mãe\", if this already used in PAI field above>":
      motherGuardian?.rg ?? "",
    "<Guardian.cpf when Guardian.kinship == \"Mãe\", if this already used in PAI field above>":
      motherGuardian?.cpf ?? "",
    "<Guardian.address used at PAI field>": primaryGuardian?.address ?? "",
    "<Guardian.mobile used at PAI field>": primaryGuardian?.mobile ?? "",
    "<School.name>": data.school?.name ?? "",
    "<Contract.period>": data.contract.period ?? data.student.period ?? "",
    "<Student.grade>": data.student.grade ?? "",
    "<MÊS DE CADASTRO/ALTERAÇÃO DE Student.vanId>": contractStartMonth,
    "<ANO DE CADASTRO/ALTERAÇÃO DE Student.vanId>": contractStartYear,
    "<Van.monthlyFee * Number of months of validity>": formatCurrency(totalFee),
    "<Fee amount in words>": currencyToWordsPt(totalFee),
    "<Number of months of validity>": contractMonths.toString(),
    "<Contract.billingDay>": data.contract.billingDay.toString().padStart(2, "0"),
    "<Contract.terminationPenaltyValue>": formatCurrency(data.contract.rescissionFine),
    "<Contract.forumCity>": data.contract.forumCity,
    "<Day from Contract.signedAt>": format(signDate, "dd"),
    "<Word of mouth from Contract.signedAt>": toMonthName(signDate),
    "<Year from Contract.signedAt>": format(signDate, "yyyy"),
    "<Guardian.name used at PAI field>": primaryGuardian?.name ?? "",
  };

  const filledTemplate = fillTemplate(template, replacements);
  const lines = filledTemplate.split(/\r?\n/).flatMap(wrapLine);

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage();
  const font = await pdfDoc.embedFont(StandardFonts.Courier);
  const { height } = page.getSize();

  let cursorY = height - PAGE_MARGIN;

  for (const line of lines) {
    if (cursorY <= PAGE_MARGIN) {
      page = pdfDoc.addPage();
      cursorY = height - PAGE_MARGIN;
    }

    page.drawText(line, {
      x: PAGE_MARGIN,
      y: cursorY,
      size: FONT_SIZE,
      font,
    });
    cursorY -= LINE_HEIGHT;
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

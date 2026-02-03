import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { format } from "date-fns";

export type ContractPdfData = {
  studentName: string;
  studentBirthDate?: Date | null;
  guardianName: string;
  guardianAddress?: string | null;
  guardianPhone?: string | null;
  schoolName?: string | null;
  studentGrade?: string | null;
  driverName?: string | null;
};

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "docs",
  "Contrarto-perueiro-responsavel.pdf",
);

const DEFAULT_FONT_SIZE = 9;

const fieldPositions = {
  studentName: { x: 90, y: 640 },
  studentBirthDate: { x: 155, y: 623 },
  guardianName: { x: 55, y: 604 },
  guardianNameAlt: { x: 55, y: 587 },
  guardianAddress: { x: 95, y: 569 },
  guardianPhone: { x: 95, y: 552 },
  schoolName: { x: 95, y: 535 },
  studentGrade: { x: 355, y: 535 },
  driverName: { x: 380, y: 785 },
};

const formatDate = (value?: Date | null) => {
  if (!value) return null;
  return format(value, "dd/MM/yyyy");
};

export async function generateContractPdf(data: ContractPdfData) {
  const templateBytes = await fs.readFile(TEMPLATE_PATH);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const [page] = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const drawText = (value: string | null | undefined, x: number, y: number) => {
    if (!value) return;
    page.drawText(value, { x, y, size: DEFAULT_FONT_SIZE, font });
  };

  drawText(data.studentName, fieldPositions.studentName.x, fieldPositions.studentName.y);
  drawText(formatDate(data.studentBirthDate), fieldPositions.studentBirthDate.x, fieldPositions.studentBirthDate.y);
  drawText(data.guardianName, fieldPositions.guardianName.x, fieldPositions.guardianName.y);
  drawText(data.guardianName, fieldPositions.guardianNameAlt.x, fieldPositions.guardianNameAlt.y);
  drawText(data.guardianAddress ?? null, fieldPositions.guardianAddress.x, fieldPositions.guardianAddress.y);
  drawText(data.guardianPhone ?? null, fieldPositions.guardianPhone.x, fieldPositions.guardianPhone.y);
  drawText(data.schoolName ?? null, fieldPositions.schoolName.x, fieldPositions.schoolName.y);
  drawText(data.studentGrade ?? null, fieldPositions.studentGrade.x, fieldPositions.studentGrade.y);
  drawText(data.driverName ?? null, fieldPositions.driverName.x, fieldPositions.driverName.y);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

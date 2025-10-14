-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "vanId" BIGINT;

-- AlterTable
ALTER TABLE "Van" ADD COLUMN     "billingDay" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "monthlyFee" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Payment_vanId_dueDate_idx" ON "Payment"("vanId", "dueDate");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_vanId_fkey" FOREIGN KEY ("vanId") REFERENCES "Van"("id") ON DELETE SET NULL ON UPDATE CASCADE;

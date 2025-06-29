-- DropForeignKey
ALTER TABLE "Charges" DROP CONSTRAINT "Charges_businessId_fkey";

-- AlterTable
ALTER TABLE "Charges" ALTER COLUMN "businessId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

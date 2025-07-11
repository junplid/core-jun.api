/*
  Warnings:

  - You are about to drop the column `note` on the `Orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "note",
ADD COLUMN     "actionChannels" TEXT[],
ADD COLUMN     "connectionWAId" INTEGER,
ADD COLUMN     "data" TEXT,
ADD COLUMN     "delivery_code" VARCHAR(12),
ADD COLUMN     "delivery_method" TEXT,
ADD COLUMN     "flowId" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE SET NULL ON UPDATE CASCADE;

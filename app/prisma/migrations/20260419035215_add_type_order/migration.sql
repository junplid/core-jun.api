-- CreateEnum
CREATE TYPE "TypeOrder" AS ENUM ('TABLE', 'MENU');

-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_tableId_fkey";

-- AlterTable
ALTER TABLE "MenuOnlineItemOfOrder" ADD COLUMN     "qnt" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "type" "TypeOrder" NOT NULL DEFAULT 'TABLE';

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

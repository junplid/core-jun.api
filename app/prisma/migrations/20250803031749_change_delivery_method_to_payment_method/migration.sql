/*
  Warnings:

  - You are about to drop the column `delivery_method` on the `Orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "delivery_method",
ADD COLUMN     "payment_method" TEXT;

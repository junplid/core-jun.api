/*
  Warnings:

  - The `delivery_fee` column on the `MenuInfo` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "MenuInfo" DROP COLUMN "delivery_fee",
ADD COLUMN     "delivery_fee" DECIMAL(6,2);

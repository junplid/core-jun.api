/*
  Warnings:

  - You are about to drop the column `lat` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `Orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "lat",
DROP COLUMN "lng",
DROP COLUMN "number",
ADD COLUMN     "delivery_lat" DOUBLE PRECISION,
ADD COLUMN     "delivery_lng" DOUBLE PRECISION,
ADD COLUMN     "delivery_number" TEXT;

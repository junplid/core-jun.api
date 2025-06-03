/*
  Warnings:

  - You are about to drop the column `amountShorts` on the `ShootingSpeed` table. All the data in the column will be lost.
  - Added the required column `numberShots` to the `ShootingSpeed` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ShootingSpeed" DROP COLUMN "amountShorts",
ADD COLUMN     "numberShots" INTEGER NOT NULL;

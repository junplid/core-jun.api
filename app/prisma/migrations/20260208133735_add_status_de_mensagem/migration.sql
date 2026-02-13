-- CreateEnum
CREATE TYPE "TypeStatusMessage" AS ENUM ('SENT', 'DELIVERED');

-- AlterTable
ALTER TABLE "Messages" ADD COLUMN     "status" "TypeStatusMessage" NOT NULL DEFAULT 'SENT';

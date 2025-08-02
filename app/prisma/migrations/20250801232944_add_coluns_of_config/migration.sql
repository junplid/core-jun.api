-- AlterTable
ALTER TABLE "MenusOnline" ADD COLUMN     "label" TEXT,
ADD COLUMN     "label1" TEXT,
ADD COLUMN     "status" BOOLEAN DEFAULT false,
ADD COLUMN     "titlePage" TEXT;

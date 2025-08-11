-- AlterEnum
ALTER TYPE "TypeStatusOrder" ADD VALUE 'ready';

-- AlterTable
ALTER TABLE "FlowState" ADD COLUMN     "typeNode" TEXT;

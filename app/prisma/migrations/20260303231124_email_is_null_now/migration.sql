-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "emailEncrypted" DROP NOT NULL,
ALTER COLUMN "emailHash" DROP NOT NULL;

-- AlterTable
ALTER TABLE "AgentTemplates" ADD COLUMN     "flag" TEXT;

-- CreateEnum
CREATE TYPE "TypeContact" AS ENUM ('instagram', 'whatsapp', 'messenger');

-- AlterTable
ALTER TABLE "ContactsWA" ADD COLUMN     "channel" "TypeContact" NOT NULL DEFAULT 'whatsapp',
ADD COLUMN     "name" VARCHAR(255),
ADD COLUMN     "username" VARCHAR(150);

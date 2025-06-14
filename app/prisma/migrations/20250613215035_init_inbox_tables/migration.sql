-- CreateEnum
CREATE TYPE "TypeStatusTicket" AS ENUM ('new', 'open', 'resolved', 'deleted');

-- CreateEnum
CREATE TYPE "TypeDestinationTicket" AS ENUM ('department', 'user');

-- CreateTable
CREATE TABLE "InboxUsers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "hash" TEXT NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "password" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inboxDepartmentId" INTEGER,

    CONSTRAINT "InboxUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboxDepartments" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "sign_business" BOOLEAN NOT NULL DEFAULT false,
    "signSector" BOOLEAN NOT NULL DEFAULT false,
    "signAttendant" BOOLEAN NOT NULL DEFAULT false,
    "previewNumber" BOOLEAN NOT NULL DEFAULT true,
    "previewPhone" BOOLEAN NOT NULL DEFAULT true,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "businessId" INTEGER NOT NULL,

    CONSTRAINT "InboxDepartments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tickets" (
    "id" SERIAL NOT NULL,
    "protocol" TEXT NOT NULL,
    "status" "TypeStatusTicket" NOT NULL DEFAULT 'new',
    "destination" "TypeDestinationTicket" NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inboxUserId" INTEGER,
    "inboxDepartmentId" INTEGER NOT NULL,
    "contactWAOnAccountId" INTEGER NOT NULL,
    "connectionWAId" INTEGER NOT NULL,

    CONSTRAINT "Tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InboxUsers_email_key" ON "InboxUsers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InboxUsers_email_hash_key" ON "InboxUsers"("email", "hash");

-- CreateIndex
CREATE INDEX "InboxDepartments_id_name_businessId_idx" ON "InboxDepartments"("id", "name", "businessId");

-- CreateIndex
CREATE INDEX "Tickets_id_protocol_contactWAOnAccountId_status_destination_idx" ON "Tickets"("id", "protocol", "contactWAOnAccountId", "status", "destination", "inboxDepartmentId", "inboxUserId");

-- AddForeignKey
ALTER TABLE "InboxUsers" ADD CONSTRAINT "InboxUsers_inboxDepartmentId_fkey" FOREIGN KEY ("inboxDepartmentId") REFERENCES "InboxDepartments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxDepartments" ADD CONSTRAINT "InboxDepartments_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_inboxUserId_fkey" FOREIGN KEY ("inboxUserId") REFERENCES "InboxUsers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_inboxDepartmentId_fkey" FOREIGN KEY ("inboxDepartmentId") REFERENCES "InboxDepartments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_contactWAOnAccountId_fkey" FOREIGN KEY ("contactWAOnAccountId") REFERENCES "ContactsWAOnAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

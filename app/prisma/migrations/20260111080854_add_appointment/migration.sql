-- CreateEnum
CREATE TYPE "TypeCreateByAppointments" AS ENUM ('human', 'bot');

-- CreateEnum
CREATE TYPE "StatusAppointments" AS ENUM ('suggested', 'pending_confirmation', 'confirmed', 'canceled', 'completed', 'expired');

-- CreateEnum
CREATE TYPE "StatusAppointmentReminders" AS ENUM ('pending', 'sent', 'failed', 'canceled');

-- CreateTable
CREATE TABLE "Appointments" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT,
    "n_appointment" TEXT NOT NULL,
    "status" "StatusAppointments" NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "createdBy" "TypeCreateByAppointments" NOT NULL DEFAULT 'bot',
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,
    "actionChannels" TEXT[],
    "flowNodeId" TEXT,
    "flowId" TEXT,
    "flowStateId" INTEGER,
    "contactsWAOnAccountId" INTEGER,
    "connectionWAId" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentReminders" (
    "id" SERIAL NOT NULL,
    "notify_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "status" "StatusAppointmentReminders" NOT NULL DEFAULT 'pending',
    "flowNodeId" TEXT,
    "appointmentId" INTEGER NOT NULL,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentReminders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_flowStateId_fkey" FOREIGN KEY ("flowStateId") REFERENCES "FlowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_contactsWAOnAccountId_fkey" FOREIGN KEY ("contactsWAOnAccountId") REFERENCES "ContactsWAOnAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_connectionWAId_fkey" FOREIGN KEY ("connectionWAId") REFERENCES "ConnectionWA"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentReminders" ADD CONSTRAINT "AppointmentReminders_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

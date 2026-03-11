-- CreateEnum
CREATE TYPE "TypePaymentMethods" AS ENUM ('Dinheiro', 'Pix', 'Cartao_Credito', 'Cartao_Debito');

-- AlterTable
ALTER TABLE "MenuInfo" ADD COLUMN     "payment_methods" "TypePaymentMethods"[];

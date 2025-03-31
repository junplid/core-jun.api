import moment from "moment-timezone";
import { prisma } from "../../adapters/Prisma/client";
import { GetPaymentsADMDTO_I } from "./DTO";
import { AsaasGetPayments } from "../../services/Assas/Payments";

const PaymentStatusTranslate: { [s: string]: string } = {
  PENDING: "Pendente",
  RECEIVED: "Recebida",
  CONFIRMED: "Confirmada",
  OVERDUE: "Atrasada",
  REFUNDED: "Reembolsado",
  RECEIVED_IN_CASH: "Recebido em dinheiro",
  REFUND_REQUESTED: "Reembolso solicitado",
  REFUND_IN_PROGRESS: "Reembolso em andamento",
  CHARGEBACK_REQUESTED: "Estorno solicitado",
  CHARGEBACK_DISPUTE: "Estorno em disputa",
  AWAITING_CHARGEBACK_REVERSAL: "Aguardando reversão de estorno",
  DUNNING_REQUESTED: "Cobrança solicitada",
  DUNNING_RECEIVED: "Cobrança recebida",
  AWAITING_RISK_ANALYSIS: "Aguardando análise de risco",
};

export class GetPaymentsADMUseCase {
  constructor() {}

  async run(dto: GetPaymentsADMDTO_I) {
    const account = await prisma.account.findUnique({
      where: { id: dto.accountId },
      select: { customerId: true },
    });

    if (!account?.customerId) {
      return {
        message: "OK!",
        status: 200,
        payments: [],
      };
    }

    const payments = await AsaasGetPayments({
      customer: account.customerId,
    });

    const nextPayment = payments.data.map((pay: any) => {
      return {
        id: pay.id,
        status: PaymentStatusTranslate[pay.status],
        statusName: pay.status,
        dateCreated: moment(pay.dateCreated).format("DD/MM/YYYY"),
        invoiceUrl: pay.invoiceUrl,
        transactionReceiptUrl: pay.transactionReceiptUrl,
        paymentDate: pay.paymentDate
          ? moment(pay.paymentDate).format("DD/MM/YYYY")
          : null,
        dueDate: moment(pay.dueDate).format("DD/MM/YYYY"),
        billingType: pay.billingType,
        value: pay.value,
      };
    });

    return { message: "OK!", status: 200, payments: nextPayment };
  }
}

import moment from "moment-timezone";
import { prisma } from "../../adapters/Prisma/client";
import { GetPaymentsSubscriptionsADMDTO_I } from "./DTO";
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

export class GetPaymentsSubscriptionsADMUseCase {
  constructor() {}

  async run(dto: GetPaymentsSubscriptionsADMDTO_I) {
    const accountSubscription = await prisma.accountSubscriptions.findUnique({
      where: { id: dto.id },
      select: {
        subscriptionsId: true,
        Account: { select: { customerId: true } },
      },
    });

    if (!accountSubscription) {
      return {
        message: "Assinatura não encontrada!",
        status: 400,
      };
    }

    const payments = await AsaasGetPayments({
      subscription: accountSubscription.subscriptionsId,
      customer: accountSubscription.Account.customerId || undefined,
    });

    const nextPayment = payments.data.map((pay: any) => {
      return {
        id: pay.id,
        status: PaymentStatusTranslate[pay.status],
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

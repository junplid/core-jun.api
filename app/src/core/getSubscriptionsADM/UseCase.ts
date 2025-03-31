import moment from "moment-timezone";
import { prisma } from "../../adapters/Prisma/client";
import {
  getAsaasSubscription,
  getAsaasSubscriptions,
} from "../../services/Assas/Subscriptions";
import { GetSubscriptionsADMDTO_I } from "./DTO";
import { AsaasGetPayments } from "../../services/Assas/Payments";
import { v4 } from "uuid";
import { calculateCycleDateRange } from "../../helpers/calculateCycleDateRange";
import { TypeCyclePlanPeriods } from "@prisma/client";

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

const SubscriptionStatusTranslate: { [s: string]: string } = {
  REQUESTED: "Assinatura solicitada",
  ACTIVE: "Ativa",
  INACTIVE: "Inativa",
  INTERRUPTED: "Interrompida",
};

const SubscriptionCycleTranslate: { [s in TypeCyclePlanPeriods]: string } = {
  MONTHLY: "Mensal",
  BIMONTHLY: "Bimensal",
  BIWEEKLY: "Quinzenal",
  QUARTERLY: "Trimestral",
  SEMIANNUALLY: "Semestralmente",
  WEEKLY: "Semanalmente",
  YEARLY: "Anual",
};

export class GetSubscriptionsADMUseCase {
  constructor() {}

  async run(dto: GetSubscriptionsADMDTO_I) {
    const customer = await prisma.account.findFirst({
      where: { id: dto.accountId },
      select: {
        customerId: true,
        AccountSubscriptions: {
          orderBy: { id: "desc" },
          select: {
            id: true,
            planPeriodsId: true,
            dateOfCancellation: true,
            subscriptionsId: true,
            ExtraPackage: { select: { name: true, id: true } },
            PlanPeriods: {
              select: { Plan: { select: { name: true, id: true } } },
            },
          },
        },
      },
    });

    if (!customer?.customerId || !customer.AccountSubscriptions.length) {
      return {
        message: "Você ainda não assinou nenhum plano",
        status: 200,
        subscriptions: null,
      };
    }

    let subscriptions: any[] = [];

    if (!dto.all) {
      for await (const sub of customer.AccountSubscriptions) {
        const subscription = await getAsaasSubscription({
          id: sub.subscriptionsId,
        });
        if (subscription.status === "ACTIVE")
          subscriptions.push({
            ...subscription,
            subscriptionId: sub.id,
            name: sub.ExtraPackage?.name || sub.PlanPeriods?.Plan.name,
          });
      }
    } else {
      for await (const sub of customer.AccountSubscriptions) {
        const subscription = await getAsaasSubscription({
          id: sub.subscriptionsId,
        });
        subscriptions.push({
          ...subscription,
          subscriptionId: sub.id,
          name: sub.ExtraPackage?.name || sub.PlanPeriods?.Plan.name,
        });
      }
    }

    console.log(subscriptions);

    if (!subscriptions.length) {
      return {
        message: "Você ainda não assinou nenhum plano",
        status: 200,
        subscriptions: null,
      };
    }

    if (!dto.all) {
      const subs = await Promise.all(
        subscriptions.map(async (current) => {
          const { dateEnd, dateStart } = calculateCycleDateRange(current.cycle);

          const payments = await AsaasGetPayments({
            subscription: current.id,
            "dateCreated[ge]": dateStart,
            "dateCreated[le]": dateEnd,
          });

          let isRegular = false;
          if (!payments.totalCount) {
            // SE NÃO TIVER NENHUMA COBRANÇA. SIGNIFICA QUE NÃO FOI LANÇADO AINDA
            //   = ENTÃO DEIXAR USAR NORMALMENTE O SISTEMA
            isRegular = true;
          }
          isRegular = payments.data.some((pay: any) => {
            return ["PENDING", "RECEIVED", "CONFIRMED"].includes(pay.status);
          });

          return {
            id: current.subscriptionId,
            name: current?.name || "PLANO REMOVIDO",
            status: isRegular ? "Ativo" : "Interrompido",
            value: current.value,
            // @ts-expect-error
            cycle: SubscriptionCycleTranslate[current.cycle],
            dateStartPeriod: current.dateCreated,
            cancellationDate:
              customer.AccountSubscriptions[0].dateOfCancellation,
          };
        })
      );
      return {
        message: "OK!",
        status: 200,
        subscriptions: subs,
      };
    } else {
      const nextStateSubscriptions = await Promise.all(
        subscriptions.map(async (sub) => {
          const { dateEnd, dateStart } = calculateCycleDateRange(sub.cycle);

          const payments = await AsaasGetPayments({
            subscription: sub.id,
            "dateCreated[ge]": dateStart,
            "dateCreated[le]": dateEnd,
          });

          let isRegular = false;
          if (!payments.totalCount) {
            // SE NÃO TIVER NENHUMA COBRANÇA. SIGNIFICA QUE NÃO FOI LANÇADO AINDA
            //   = ENTÃO DEIXAR USAR NORMALMENTE O SISTEMA
            isRegular = true;
          }

          // SE TIVER COBRANÇA COM STATUS !== PENDING, RECEIVED, CONFIRMED.
          //   = ENTÃO DEVE INTERROMPER OS RECURSOS PARA ESSE CLIENTE
          isRegular = payments.data.some((pay: any) => {
            return ["PENDING", "RECEIVED", "CONFIRMED"].includes(pay.status);
          });

          return {
            id: sub.subscriptionId,
            name: sub?.name || "PLANO REMOVIDO",
            status:
              sub.status === "ACTIVE"
                ? isRegular
                  ? "Ativo"
                  : "Interrompido"
                : "Finalizado",
            value: sub.value,
            // @ts-expect-error
            cycle: SubscriptionCycleTranslate[sub.cycle],
            dateStartPeriod: sub.dateCreated,
            cancellationDate:
              customer.AccountSubscriptions[0].dateOfCancellation,
          };
        })
      );

      return {
        message: "OK!",
        status: 200,
        subscriptions: nextStateSubscriptions,
      };
    }
  }
}

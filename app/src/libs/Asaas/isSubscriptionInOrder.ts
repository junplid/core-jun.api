import moment from "moment-timezone";
import { getAsaasSubscription } from "../../services/Assas/Subscriptions";
import { AsaasGetPayments } from "../../services/Assas/Payments";

/**
 * Caso a assinatura esteja em regular retornarar `true`
 * @param subscriptionId string
 * @returns boolean
 */
export async function isSubscriptionInOrder(
  subscriptionId: string
): Promise<boolean> {
  const subscription = await getAsaasSubscription({
    id: subscriptionId,
  });

  if (!subscription) return false;

  let dateStart = "";
  let dateEnd = "";

  if (subscription.cycle === "MONTHLY") {
    dateStart = moment().startOf("month").format("YYYY-MM-DD");
    dateEnd = moment().endOf("month").format("YYYY-MM-DD");
  } else if (subscription.cycle === "BIMONTHLY") {
    dateStart = moment()
      .subtract(1, "month")
      .startOf("month")
      .format("YYYY-MM-DD");
    dateEnd = moment().endOf("month").format("YYYY-MM-DD");
  } else if (subscription.cycle === "BIWEEKLY") {
    dateStart = moment()
      .subtract(2, "weeks")
      .startOf("isoWeek")
      .format("YYYY-MM-DD");
    dateEnd = moment().endOf("isoWeek").format("YYYY-MM-DD");
  } else if (subscription.cycle === "WEEKLY") {
    dateStart = moment().startOf("isoWeek").format("YYYY-MM-DD");
    dateEnd = moment().endOf("isoWeek").format("YYYY-MM-DD");
  } else if (subscription.cycle === "QUARTERLY") {
    dateStart = moment().startOf("quarter").format("YYYY-MM-DD");
    dateEnd = moment().endOf("quarter").format("YYYY-MM-DD");
  } else if (subscription.cycle === "SEMIANNUALLY") {
    const isFirstHalf = moment().month() < 6;
    if (isFirstHalf) {
      dateStart = moment().startOf("year").format("YYYY-MM-DD");
      dateEnd = moment().month(5).endOf("month").format("YYYY-MM-DD");
    } else {
      dateStart = moment().month(6).startOf("month").format("YYYY-MM-DD");
      dateEnd = moment().endOf("year").format("YYYY-MM-DD");
    }
  } else if (subscription.cycle === "YEARLY") {
    dateStart = moment().startOf("year").format("YYYY-MM-DD");
    dateEnd = moment().endOf("year").format("YYYY-MM-DD");
  }

  const payments = await AsaasGetPayments({
    subscription: subscription.id,
    "dateCreated[ge]": dateStart,
    "dateCreated[le]": dateEnd,
  });
  if (!payments.totalCount) {
    // SE NÃO TIVER NENHUMA COBRANÇA. SIGNIFICA QUE NÃO FOI LANÇADO AINDA
    //   = ENTÃO DEIXAR USAR NORMALMENTE O SISTEMA
    return true;
  }

  // SE TIVER COBRANÇA COM STATUS !== PENDING, RECEIVED, CONFIRMED.
  //   = ENTÃO DEVE INTERROMPER OS RECURSOS PARA ESSE CLIENTE
  return payments.data.some((pay: any) => {
    return ["PENDING", "RECEIVED", "CONFIRMED"].includes(pay.status);
  });
}

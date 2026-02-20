import { prisma } from "../../adapters/Prisma/client";
import { GetSubscriptionDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { stripe } from "../../services/stripe/stripe.client";
import Stripe from "stripe";
import moment from "moment-timezone";

export class GetSubscriptionUseCase {
  constructor() {}

  async run(dto: GetSubscriptionDTO_I) {
    try {
      const account = await prisma.account.findUnique({
        where: { id: dto.accountId },
        select: {
          Subscription: {
            select: { customerId: true, stripeSubscriptionId: true },
          },
        },
      });

      if (!account) {
        throw new ErrorResponse(401).toast({
          title: `Não autorizado!`,
          type: "error",
        });
      }

      if (!account.Subscription || !account.Subscription.stripeSubscriptionId) {
        return {
          message: "",
          status: 200,
          subscription: null,
        };
      }

      const subscription = await stripe.subscriptions.retrieve(
        account.Subscription.stripeSubscriptionId,
        { expand: ["default_payment_method", "items.data.price.product"] },
      );

      const price = subscription.items.data[0];
      const product = price.price.product as Stripe.Product;
      const paymentMethod =
        subscription.default_payment_method as Stripe.PaymentMethod | null;

      const period_end_price = moment
        .unix(price.current_period_end)
        .toISOString();

      return {
        message: "",
        status: 200,
        subscription: {
          planName: product.name,
          autoRenew: !subscription.cancel_at_period_end,
          status: subscription.status,
          currentPeriodEnd: period_end_price,
          cardBrand: paymentMethod?.card?.brand,
          cardLast4: paymentMethod?.card?.last4,
        },
      };
    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      } else {
        throw new ErrorResponse(500).toast({
          title: `Erro ao obter conta!`,
          type: "error",
        });
      }
    }
  }
}

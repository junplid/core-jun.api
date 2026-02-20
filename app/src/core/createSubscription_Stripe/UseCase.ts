import { CreateSubscription_StripeDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { stripe } from "../../services/stripe/stripe.client";
import Stripe from "stripe";

const plans = [
  { id: 1, name: "Mensal", price: "price_1T2OWWE4fh62j4kl5DtUPuVt" },
  { id: 2, name: "Anual", price: "price_1T2OXCE4fh62j4kl31zZ6Kq1" },
];

const stripeErrorMap: Record<string, string> = {
  fraudulent: "Seu cartão foi recusado.",
  insufficient_funds: "Saldo insuficiente. Verifique o limite do seu cartão.",
  card_declined: "Seu o cartão foi recusado.",
  expired_card: "Este cartão está vencido.",
  incorrect_cvc: "O código de segurança (CVC) está incorreto.",
  stolen_card: "Transação não autorizada.",
  processing_error: "Ocorreu um erro ao processar seu cartão. Tente novamente.",
  intent_confirmation_at_setup_failed:
    "Não foi possível validar seu cartão. Tente novamente.",
};

export class CreateSubscription_StripeUseCase {
  constructor() {}

  async run({
    accountId,
    paymentMethodId,
    planId,
  }: CreateSubscription_StripeDTO_I) {
    try {
      const exist = await prisma.accountSubscription.findFirst({
        where: { accountId: accountId },
        select: { customerId: true },
      });

      if (!exist || !exist.customerId) throw new ErrorResponse(401);

      let fingerprint: string | null | undefined;
      if (paymentMethodId) {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: exist.customerId,
        });

        const paymentMethod =
          await stripe.paymentMethods.retrieve(paymentMethodId);
        fingerprint = paymentMethod.card?.fingerprint;
        stripe.customers.update(exist.customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      }
      // else {
      //   const customer = await stripe.customers.retrieve(exist.customerId);
      //   const defaultPaymentMethodId = (customer as Stripe.Customer)
      //     .invoice_settings.default_payment_method as string | null;
      //   if (!defaultPaymentMethodId) {
      //     throw new ErrorResponse(400).container(
      //       "Forma de pagamento não encontrada!",
      //     );
      //   }
      //   payMethod = defaultPaymentMethodId;
      // }

      const plan = plans.find((p) => p.id === planId);

      if (!plan)
        throw new ErrorResponse(400).container("Plano não encontrado!");

      const { status, id } = await stripe.subscriptions.create({
        customer: exist.customerId,
        items: [{ price: plan.price }],
        expand: ["latest_invoice.payment_intent"],
        payment_behavior: "error_if_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
      });

      await prisma.accountSubscription.update({
        where: { customerId: exist.customerId },
        data: {
          cardFingerprint: fingerprint,
          stripeSubscriptionId: id,
          subscriptionStatus: status,
        },
      });
      return { status: 201 };
    } catch (error: any) {
      if (error.type === "StripeCardError") {
        const msgPt =
          stripeErrorMap[error.decline_code] ||
          stripeErrorMap[error.code] ||
          "Ocorreu um erro inesperado com seu pagamento.";

        throw new ErrorResponse(400).input({
          path: "creditCard",
          text: msgPt,
        });
      }
      throw error;
    }
  }
}

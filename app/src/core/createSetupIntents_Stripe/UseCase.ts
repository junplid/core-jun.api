import { CreateSetupIntents_StripeDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { decrypte } from "../../libs/encryption";
import { stripe } from "../../services/stripe/stripe.client";

export class CreateSetupIntents_StripeUseCase {
  constructor() {}

  async run({ accountId }: CreateSetupIntents_StripeDTO_I) {
    try {
      const exist = await prisma.account.findFirst({
        where: { id: accountId },
        select: {
          emailEncrypted: true,
          name: true,
          ContactsWA: { select: { completeNumber: true } },
          Subscription: { select: { customerId: true } },
        },
      });

      if (!exist) throw new ErrorResponse(401);

      let customerId: string;

      if (!exist.Subscription?.customerId) {
        try {
          const email = decrypte(exist.emailEncrypted) as string;
          const customer = await stripe.customers.create({
            email: email,
            name: exist.name!,
            phone: exist.ContactsWA.completeNumber,
          });
          customerId = customer.id;
        } catch (error) {
          throw new ErrorResponse(500);
        }
      } else {
        customerId = exist.Subscription.customerId;
      }

      const { client_secret } = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ["card"],
      });

      return { status: 201, client_secret };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

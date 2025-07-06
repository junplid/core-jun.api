import { RegisterIntentDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { stripe } from "../../services/Stripe";

export class RegisterIntentUseCase {
  constructor() {}

  async run({ number, affiliate, ...dto }: RegisterIntentDTO_I) {
    await prisma.contactsWA.upsert({
      where: { completeNumber: number },
      create: { completeNumber: number },
      update: {},
      select: { id: true },
    });

    const exist = !!(await prisma.account.findFirst({
      where: {
        OR: [{ email: dto.email }, { ContactsWA: { completeNumber: number } }],
      },
      select: { id: true },
    }));

    const found = await stripe.customers.search({
      query: `email:"${dto.email}" AND deleted:'false'`,
      limit: 1,
    });

    if (exist || found.data[0].id) {
      throw new ErrorResponse(400)
        .input({
          path: "email",
          text: "Este campo pode está vinculado a outra conta. Faça o login.",
        })
        .input({
          path: "number",
          text: "Este campo pode está vinculado a outra conta. Faça o login.",
        });
    }

    const customer = await stripe.customers.create({
      email: dto.email,
      name: dto.name,
      phone: number,
    });

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      usage: "off_session",
      confirm: true,
    });

    return { clientSecret: setupIntent.client_secret, customerId: customer.id };
  }
}

import { CreateAccountDTO_I } from "./DTO";
import { genSalt, hash as hashBcrypt } from "bcrypt";
import { createTokenAuth } from "../../helpers/authToken";
import { prisma } from "../../adapters/Prisma/client";
// import { ErrorResponse } from "../../utils/ErrorResponse";
// import { stripe } from "../../services/Stripe";

export class CreateAccountUseCase {
  constructor() {}

  async run({
    number,
    affiliate,
    // paymentMethodId,
    ...dto
  }: CreateAccountDTO_I) {
    try {
      const { id: contactWAId } = await prisma.contactsWA.upsert({
        where: { completeNumber: number },
        create: { completeNumber: number },
        update: {},
        select: { id: true },
      });

      const exist = !!(await prisma.account.findFirst({
        where: {
          OR: [
            { email: dto.email },
            { ContactsWA: { completeNumber: number } },
          ],
        },
      }));

      // const found = await stripe.customers.search({
      //   query: `email:"${dto.email}"`,
      //   limit: 1,
      // });

      // if (found.total_count || exist) {
      //   throw new ErrorResponse(400)
      //     .input({
      //       path: "email",
      //       text: "Este campo pode está vinculado a outra conta. Faça o login.",
      //     })
      //     .input({
      //       path: "number",
      //       text: "Este campo pode está vinculado a outra conta. Faça o login.",
      //     });
      // }

      // const customer = await stripe.customers.create({
      //   email: dto.email,
      //   name: dto.name,
      //   phone: number,
      // });
      // await stripe.paymentMethods.attach(paymentMethodId, {
      //   customer: customer.id,
      // });
      // const si = await stripe.setupIntents.create({
      //   customer: customer.id,
      //   payment_method: paymentMethodId,
      //   confirm: true,
      //   usage: "off_session",
      //   payment_method_types: ["card"],
      // });

      // if (si.status !== "succeeded") {
      //   await stripe.paymentMethods.detach(paymentMethodId);
      //   await stripe.customers.del(customer.id);
      //   throw new ErrorResponse(400).input({
      //     path: "email",
      //     text: "Não foi possível confirmar sua identidade. Cartão não autorizado.",
      //   });
      // }

      // await stripe.customers.update(customer.id, {
      //   invoice_settings: { default_payment_method: paymentMethodId },
      // });

      const salt = await genSalt(8);
      const nextPassword = await hashBcrypt(dto.password, salt);

      const assetsUsedId = await prisma.accountAssetsUsed.create({
        data: { chatbots: 0 },
      });

      const { id, hash: hashAccount } = await prisma.account.create({
        data: {
          ...dto,
          password: nextPassword,
          contactWAId,
          assetsUsedId: assetsUsedId.id,
          // customerId: customer.id,
        },
        select: { id: true, hash: true },
      });

      // cria o provedor free pra ser usado na versão alfa
      // depois remover isso, vamos testar; a ideia é não vazar os prompt de system
      await prisma.providerCredential.create({
        data: {
          accountId: id,
          apiKey:
            "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",
          label: "Free Provider",
          provider: "openai",
        },
        select: { id: true },
      });

      const token = await createTokenAuth(
        { id, type: "adm", hash: hashAccount },
        "secret123"
      );

      return { status: 201, token };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

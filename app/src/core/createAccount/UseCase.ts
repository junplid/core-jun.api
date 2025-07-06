import { CreateAccountDTO_I } from "./DTO";
import { genSalt, hash as hashBcrypt } from "bcrypt";
import { createTokenAuth } from "../../helpers/authToken";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { stripe } from "../../services/Stripe";

export class CreateAccountUseCase {
  constructor() {}

  async run({ number, affiliate, ...dto }: CreateAccountDTO_I) {
    const { id: contactWAId } = await prisma.contactsWA.upsert({
      where: { completeNumber: number },
      create: { completeNumber: number },
      update: {},
      select: { id: true },
    });

    const exist = !!(await prisma.account.count({
      where: {
        OR: [{ email: dto.email }, { ContactsWA: { completeNumber: number } }],
      },
    }));

    if (exist) {
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

    const found = await stripe.customers.search({
      query: `email:"${dto.email}" AND deleted:'false'`,
      limit: 1,
    });

    if (!found.total_count) {
      throw new ErrorResponse(400).input({
        path: "email",
        text: "Não foi possivel encontrar a conta. Contate o nosso suporte.",
      });
    }

    // await stripe.paymentMethods.attach(dto.paymentMethodId, {
    //   customer: dto.customerId,
    // });
    // await stripe.customers.update(dto.customerId, {
    //   invoice_settings: { default_payment_method: dto.paymentMethodId },
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
        // customerId: dto.customerId,
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

    // if (affiliate) {
    //   const alreadyExistAffiliate = await prisma.affiliates.findFirst({
    //     where: { reference: affiliate },
    //     select: { id: true },
    //   });

    //   if (!!alreadyExistAffiliate) {
    //     await prisma.handleAccountAffiliates.create({
    //       data: { accountId: id, affiliateId: alreadyExistAffiliate.id },
    //     });
    //   }
    // }

    // await prisma.account.update({
    //   where: { id },
    //   data: { planId: planFree.id },
    // });

    const token = await createTokenAuth(
      { id, type: "adm", hash: hashAccount },
      "secret123"
    );

    return { status: 201, token };
  }
}

import { CreateAccountDTO_I } from "./DTO";

import { genSalt, hash as hashBcrypt } from "bcrypt";
import { createTokenAuth } from "../../helpers/authToken";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateAccountUseCase {
  constructor() {}

  async run({ number, affiliate, ...dto }: CreateAccountDTO_I) {
    const planFree = await prisma.plan.findFirst({
      where: {
        type: "free",
        isDefault: true,
        acceptsNewUsers: true,
        activeFoSubscribers: true,
      },
      select: { id: true },
    });

    if (!planFree) {
      throw new ErrorResponse(400).toast({
        title: "Plano free padrão não encontrado",
        type: "error",
      });
    }

    const salt = await genSalt(8);
    const nextPassword = await hashBcrypt(dto.password, salt);

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

    const assetsUsedId = await prisma.accountAssetsUsed.create({
      data: { marketingSends: 0 },
    });

    const { id, hash: hashAccount } = await prisma.account.create({
      data: {
        ...dto,
        password: nextPassword,
        contactWAId,
        assetsUsedId: assetsUsedId.id,
      },
      select: { id: true, hash: true },
    });

    if (affiliate) {
      const alreadyExistAffiliate = await prisma.affiliates.findFirst({
        where: { reference: affiliate },
        select: { id: true },
      });

      if (!!alreadyExistAffiliate) {
        await prisma.handleAccountAffiliates.create({
          data: { accountId: id, affiliateId: alreadyExistAffiliate.id },
        });
      }
    }

    await prisma.account.update({
      where: { id },
      data: { planId: planFree.id },
    });

    const token = await createTokenAuth(
      { id, type: "adm", hash: hashAccount },
      "secret123"
    );

    return { status: 201, token };
  }
}

import { UpdateAccountToPremiumDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
import { compare, genSalt, hash as hashBcrypt } from "bcrypt";
import { hashForLookup } from "../../libs/encryption";

export class UpdateAccountToPremiumUseCase {
  constructor() {}

  async run({ rootId, email, ...dto }: UpdateAccountToPremiumDTO_I) {
    const alreadyExists = await prisma.account.findFirst({
      where: {
        OR: [
          { emailHash: email ? hashForLookup(email) : undefined },
          { ContactsWA: { completeNumber: dto.number } },
        ],
      },
      select: { id: true },
    });

    if (!alreadyExists) {
      throw new ErrorResponse(400).input({
        text: `Conta não encontrada.`,
        path: "email",
      });
    }

    await prisma.account.update({
      where: { id: alreadyExists.id },
      data: { isPremium: true },
    });

    return { status: 200, message: "OK" };
  }
}

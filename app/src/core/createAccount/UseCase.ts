import { CreateAccountDTO_I } from "./DTO";
import { genSalt, hash as hashBcrypt } from "bcrypt";
import { createTokenAuth } from "../../helpers/authToken";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateAccountUseCase {
  constructor() {}

  async run({ number, affiliate, ...dto }: CreateAccountDTO_I) {
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
          Business: { create: { name: "Master" } },
        },
        select: { id: true, hash: true },
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

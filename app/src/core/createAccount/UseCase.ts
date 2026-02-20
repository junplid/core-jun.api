import { CreateAccountDTO_I } from "./DTO";
import { genSalt, hash as hashBcrypt } from "bcrypt";
import { createTokenAuth } from "../../helpers/authToken";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { encrypt, hashForLookup } from "../../libs/encryption";
import { stripe } from "../../services/stripe/stripe.client";

export class CreateAccountUseCase {
  constructor() {}

  async run({ number, email, cpfCnpj, affiliate, ...dto }: CreateAccountDTO_I) {
    try {
      const { id: contactWAId } = await prisma.contactsWA.upsert({
        where: {
          completeNumber_page_id_channel: {
            completeNumber: number,
            channel: "whatsapp",
            page_id: "whatsapp_default",
          },
        },
        create: { completeNumber: number },
        update: {},
        select: { id: true },
      });

      const exist = !!(await prisma.account.findFirst({
        where: {
          OR: [
            { emailHash: hashForLookup(email) },
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

      const customer = await stripe.customers.create({
        email,
        name: dto.name,
      });

      const salt = await genSalt(8);
      const nextPassword = await hashBcrypt(dto.password, salt);

      const assetsUsedId = await prisma.accountAssetsUsed.create({
        data: { chatbots: 0 },
      });

      const { id, hash: hashAccount } = await prisma.account.create({
        data: {
          ...dto,
          ...(cpfCnpj && {
            cpfCnpjHash: hashForLookup(cpfCnpj),
            cpfCnpjEncrypted: encrypt(cpfCnpj),
          }),
          emailHash: hashForLookup(email),
          emailEncrypted: encrypt(email),
          password: nextPassword,
          contactWAId,
          assetsUsedId: assetsUsedId.id,
          Business: { create: { name: "Master" } },
          Subscription: { create: { customerId: customer.id } },
        },
        select: { id: true, hash: true },
      });

      const token = await createTokenAuth(
        { id, type: "adm", hash: hashAccount },
        process.env.SECRET_TOKEN_AUTH!,
      );

      return { status: 201, token };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

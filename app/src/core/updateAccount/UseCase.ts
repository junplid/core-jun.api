import { UpdateAccountDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
import { compare, genSalt, hash as hashBcrypt } from "bcrypt";
import { hashForLookup } from "../../libs/encryption";

export class UpdateAccountUseCase {
  constructor() {}

  async run({
    accountId,
    number,
    currentPassword,
    newPassword,
    repeatNewPassword,
    email,
    ...dto
  }: UpdateAccountDTO_I) {
    const alreadyExists = await prisma.account.findFirst({
      where: {
        OR: [
          { emailHash: email ? hashForLookup(email) : undefined },
          { ContactsWA: { completeNumber: number } },
        ],
      },
    });

    if (alreadyExists) {
      throw new ErrorResponse(400)
        .input({
          text: `Email ou número já cadastrado`,
          path: "email",
        })
        .input({
          text: `Email ou número já cadastrado`,
          path: "number",
        });
    }
    const account = await prisma.account.findFirst({
      where: { id: accountId },
      select: { password: true },
    });
    if (!account) throw new ErrorResponse(401);

    let newPasswordCrypto: string | undefined = undefined;
    if (currentPassword && newPassword && repeatNewPassword) {
      if (currentPassword === newPassword) {
        throw new ErrorResponse(400).input({
          text: `Nova senha deve ser diferente da atual.`,
          path: "new_password",
        });
      }
      if (newPassword !== repeatNewPassword) {
        throw new ErrorResponse(400)
          .input({
            text: `As senhas não coincidem.`,
            path: "new_password",
          })
          .input({
            path: "repeat_new_password",
            text: "As senhas não coincidem.",
          });
      }

      if (!(await compare(currentPassword, account.password))) {
        throw new ErrorResponse(400).input({
          text: `Senha atual inválida.`,
          path: "current",
        });
      }

      if (await compare(newPassword, account.password)) {
        throw new ErrorResponse(400).input({
          text: `Nova senha deve ser diferente da atual.`,
          path: "new_password",
        });
      }

      const salt = await genSalt(8);
      newPasswordCrypto = await hashBcrypt(newPassword, salt);
    }
    let contactWAId: number | undefined = undefined;

    if (number) {
      const findContactWA = await prisma.contactsWA.findFirst({
        where: { completeNumber: number },
        select: { id: true },
      });
      if (!findContactWA) {
        const { id } = await prisma.contactsWA.create({
          data: { completeNumber: number },
          select: { id: true },
        });
        contactWAId = id;
      } else {
        contactWAId = findContactWA.id;
      }
    }

    await prisma.account.update({
      where: { id: accountId },
      data: {
        ...dto,
        ...(email && { emailHash: hashForLookup(email) }),
        password: newPasswordCrypto,
        contactWAId,
      },
    });

    return { status: 200, message: "OK" };
  }
}

import { UpdateAccountDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
import { compare, genSalt, hash as hashBcrypt } from "bcrypt";

export class UpdateAccountUseCase {
  constructor() {}

  async run({
    accountId,
    number,
    currentPassword,
    nextPassword,
    ...dto
  }: UpdateAccountDTO_I) {
    const alreadyExists = await prisma.account.findFirst({
      where: {
        OR: [{ email: dto.email }, { ContactsWA: { completeNumber: number } }],
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

    let newPassword: string | undefined = undefined;
    if (currentPassword && nextPassword) {
      if (currentPassword === nextPassword) {
        throw new ErrorResponse(400).input({
          text: `A nova senha não pode ser igual a atual`,
          path: "nextPassword",
        });
      }

      const oldPasswordValid = compare(currentPassword, account.password);
      if (!oldPasswordValid) {
        throw new ErrorResponse(400).input({
          text: `Senha atual inválida`,
          path: "currentPassword",
        });
      }

      const salt = await genSalt(8);
      newPassword = await hashBcrypt(nextPassword, salt);
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
      data: { ...dto, password: newPassword, contactWAId },
    });

    return { status: 200, message: "OK" };
  }
}

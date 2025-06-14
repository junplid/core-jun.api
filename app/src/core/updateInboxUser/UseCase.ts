import { genSalt, hash as hashBcrypt } from "bcrypt";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateInboxUserDTO_I } from "./DTO";
import { v4 } from "uuid";

export class UpdateInboxUserUseCase {
  constructor() {}

  async run({ accountId, id, password, ...dto }: UpdateInboxUserDTO_I) {
    const exist = await prisma.inboxUsers.findFirst({
      where: { accountId, id },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Usuário não encontrao.`,
        type: "error",
      });
    }

    let passwordHash: string | undefined = undefined;
    if (password) {
      const salt = await genSalt(8);
      passwordHash = await hashBcrypt(password, salt);
    }

    try {
      const { InboxDepartment, updateAt } = await prisma.inboxUsers.update({
        where: { id },
        data: {
          ...dto,
          ...(passwordHash && { password: passwordHash, hash: v4() }),
        },
        select: {
          InboxDepartment: { select: { id: true, name: true } },
          updateAt: true,
        },
      });

      return {
        message: "OK!",
        status: 200,
        inboxUser: { department: InboxDepartment, updateAt },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar usuário!`,
        type: "error",
      });
    }
  }
}

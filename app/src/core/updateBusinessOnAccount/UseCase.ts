import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateBusinessOnAccountDTO_I } from "./DTO";

export class UpdateBusinessOnAccountUseCase {
  constructor() {}

  async run({ id, accountId, ...dto }: UpdateBusinessOnAccountDTO_I) {
    const exist = await prisma.business.findFirst({
      where: { accountId, id },
      select: { id: true },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Projeto não foi encontrada`,
        type: "error",
      });
    }

    const { updateAt } = await prisma.business.update({
      where: { accountId, id },
      data: dto,
      select: { updateAt: true },
    });

    return {
      message: "OK!",
      status: 200,
      business: { updateAt },
    };
  }
}

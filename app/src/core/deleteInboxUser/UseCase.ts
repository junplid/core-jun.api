import { DeleteInboxUsersDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";

export class DeleteInboxUsersUseCase {
  constructor() {}

  async run(dto: DeleteInboxUsersDTO_I) {
    const exist = await prisma.inboxUsers.findFirst({
      where: dto,
      select: { id: true },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Usuário não encontrado`,
        type: "error",
      });
    }

    await prisma.inboxUsers.delete({ where: dto });
    return { message: "OK!", status: 200 };
  }
}

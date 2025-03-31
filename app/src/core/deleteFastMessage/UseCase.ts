import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { DeleteFastMessageDTO_I } from "./DTO";

export class DeleteFastMessageUseCase {
  constructor() {}

  async run(dto: DeleteFastMessageDTO_I) {
    const exist = await prisma.fastMessage.findFirst({
      where: { id: dto.id },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Mensagem rápida não foi encontrada`,
        type: "error",
      });
    }

    await prisma.fastMessage.delete({
      where: {
        id: dto.id,
        ...(!dto.accountId && dto.userId && { attendantId: dto.userId }),
      },
    });

    return { message: "OK!", status: 200 };
  }
}

import { UpdateFastMessageHumanServiceDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class UpdateFastMessageHumanServiceUseCase {
  constructor() {}

  async run({ id, userId, ...dto }: UpdateFastMessageHumanServiceDTO_I) {
    const fetchVariableId = await prisma.fastMessage.findFirst({
      where: { id, attendantId: userId },
    });

    if (!fetchVariableId) {
      throw new ErrorResponse(400).toast({
        title: `Mensagem rápida não foi encontrada`,
        type: "error",
      });
    }

    try {
      await prisma.fastMessage.update({ where: { id }, data: dto });
      return { message: "OK!", status: 200 };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Não foi possivel atualizar a mensagem`,
        type: "error",
      });
    }
  }
}

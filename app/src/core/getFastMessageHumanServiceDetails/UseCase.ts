import { GetFastMessageHumanDetailsServiceDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetFastMessageHumanDetailsServiceUseCase {
  constructor() {}

  async run(dto: GetFastMessageHumanDetailsServiceDTO_I) {
    const attendant = await prisma.sectorsAttendants.findFirst({
      where: { id: dto.userId, Sectors: { status: true } },
      select: { accountId: true },
    });

    if (!attendant) {
      throw new ErrorResponse(401).toast({
        title: `Não autorizado!`,
        type: "error",
      });
    }

    const fastMessage = await prisma.fastMessage.findFirst({
      where: { id: dto.id, attendantId: dto.userId },
      select: {
        shortcut: true,
        value: true,
        id: true,
      },
    });

    if (!fastMessage) {
      throw new ErrorResponse(400).toast({
        title: `Mensagem rápida não foi encontrada!`,
        type: "error",
      });
    }

    return { message: "OK!", status: 200, fastMessage };
  }
}

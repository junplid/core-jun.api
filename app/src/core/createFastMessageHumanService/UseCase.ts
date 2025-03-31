import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateFastMessageHumanServiceDTO_I } from "./DTO";

export class CreateFastMessageHumanServiceUseCase {
  constructor() {}

  async run({ userId, ...dto }: CreateFastMessageHumanServiceDTO_I) {
    const exist = await prisma.fastMessage.findFirst({
      where: { attendantId: userId, shortcut: dto.shortcut },
    });

    if (exist) {
      throw new ErrorResponse(400).input({
        path: "shortcut",
        text: "Atalho de mensagem rápida já existente",
      });
    }

    const fastMessage = await prisma.fastMessage.create({
      data: { attendantId: userId, ...dto },
      select: { id: true },
    });

    return { message: "OK!", status: 201, fastMessage };
  }
}

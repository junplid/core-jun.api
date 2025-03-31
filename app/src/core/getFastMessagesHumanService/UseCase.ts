import { GetFastMessagesHumanServiceDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetFastMessagesHumanServiceUseCase {
  constructor() {}

  async run(dto: GetFastMessagesHumanServiceDTO_I) {
    const fastMessages = await prisma.fastMessage.findMany({
      where: { attendantId: dto.userId },
      orderBy: { id: "desc" },
      select: {
        shortcut: true,
        value: true,
        id: true,
      },
    });

    return { message: "OK!", status: 200, fastMessages };
  }
}

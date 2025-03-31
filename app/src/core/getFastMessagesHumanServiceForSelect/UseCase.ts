import { GetFastMessagesHumanServiceForSelectDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetFastMessagesHumanServiceForSelectUseCase {
  constructor() {}

  async run(dto: GetFastMessagesHumanServiceForSelectDTO_I) {
    const x = await prisma.fastMessage.findMany({
      where: { attendantId: dto.userId },
      orderBy: { id: "desc" },
      select: { shortcut: true, value: true, id: true },
    });

    const y = x.map(({ shortcut, ...f }) => ({
      ...f,
      name: shortcut,
    }));
    return { message: "OK!", status: 200, fastMessages: y };
  }
}

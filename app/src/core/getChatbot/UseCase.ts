import { GetChatbotDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";

export class GetChatbotUseCase {
  constructor() {}

  async run(dto: GetChatbotDTO_I) {
    const chatbot = await prisma.chatbot.findFirst({
      where: { id: dto.id, accountId: dto.accountId },
      orderBy: { id: "desc" },
      select: {
        OperatingDays: {
          select: {
            dayOfWeek: true,
            WorkingTimes: { select: { start: true, end: true } },
          },
        },
        TimeToRestart: { select: { type: true, value: true } },
        name: true,
        id: true,
        flowId: true,
        description: true,
        status: true,
        addLeadToAudiencesIds: true,
        addToLeadTagsIds: true,
        businessId: true,
        connectionWAId: true,
      },
    });

    if (!chatbot) {
      throw new ErrorResponse(400).toast({
        title: `Bot receptivo não encontrado.`,
        type: "error",
      });
    }
    const { OperatingDays, TimeToRestart, status, ...rest } = chatbot;

    let statusConnection = status;

    if (status) {
      statusConnection = !!cacheConnectionsWAOnline.get(dto.id);
    }

    return {
      message: "OK!",
      status: 200,
      chatbot: {
        ...rest,
        status: statusConnection,
        operatingDays: OperatingDays,
        timeToRestart: TimeToRestart,
      },
    };
  }
}

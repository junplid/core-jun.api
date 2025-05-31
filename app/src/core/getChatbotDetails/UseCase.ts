import { GetChatbotDetailsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";

export class GetChatbotDetailsUseCase {
  constructor() {}

  async run(dto: GetChatbotDetailsDTO_I) {
    const chatbot = await prisma.chatbot.findFirst({
      where: { id: dto.id, accountId: dto.accountId },
      orderBy: { id: "desc" },
      select: {
        ConnectionWA: {
          select: { name: true, id: true, number: true },
        },
        Business: { select: { id: true, name: true } },
        name: true,
        createAt: true,
        id: true,
        description: true,
        status: true,
        updateAt: true,
        trigger: true,
      },
    });

    if (!chatbot) {
      throw new ErrorResponse(400).toast({
        title: `Robô de recebimento não foi encontrado!`,
        type: "error",
      });
    }

    const { Business, ConnectionWA, status, trigger, ...rest } = chatbot;

    let statusConnection = status;
    let target = undefined;

    if (status && ConnectionWA) {
      statusConnection = !!cacheConnectionsWAOnline.get(dto.id);
      if (statusConnection) {
        target = `https://api.whatsapp.com/send?phone=${ConnectionWA.number}`;
        if (trigger) target += `&text=${encodeURIComponent(trigger)}`;
      }
    }

    return {
      message: "OK!",
      status: 200,
      chatbot: {
        ...rest,
        status: statusConnection,
        business: Business,
        connection: ConnectionWA,
        target,
      },
    };
  }
}

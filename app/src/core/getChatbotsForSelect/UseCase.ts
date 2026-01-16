import { GetChabotsForSelectDTO_I } from "./DTO";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { prisma } from "../../adapters/Prisma/client";

export class GetChabotsForSelectUseCase {
  constructor() {}

  async run(dto: GetChabotsForSelectDTO_I) {
    const data = await prisma.chatbot.findMany({
      where: {
        accountId: dto.accountId,
        status: dto.status,
        ...(dto.businessIds?.length && {
          businessId: { in: dto.businessIds },
        }),
        AgentAI: null,
      },
      orderBy: { id: "desc" },
      select: {
        name: true,
        id: true,
        connectionWAId: true,
        status: true,
      },
    });

    const nextData = data.map(({ connectionWAId, status, ...r }) => {
      if (!connectionWAId) {
        return { ...r, status: false };
      }
      const isConnected = sessionsBaileysWA
        .get(connectionWAId)
        ?.ev.emit("connection.update", { connection: "open" });
      return { ...r, status: status || isConnected };
    });

    return {
      message: "OK!",
      status: 200,
      chatbot: nextData,
    };
  }
}

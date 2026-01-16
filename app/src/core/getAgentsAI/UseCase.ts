import { GetAgentsAIDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";

export class GetAgentsAIUseCase {
  constructor() {}

  async run(dto: GetAgentsAIDTO_I) {
    const data = await prisma.agentAI.findMany({
      where: { accountId: dto.accountId },
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        createAt: true,
        AgentAIOnBusiness: {
          select: { Business: { select: { id: true, name: true } } },
        },
        connectionWAId: true,
      },
    });

    const agentsAI = data.map(({ AgentAIOnBusiness, connectionWAId, ...r }) => {
      if (connectionWAId) {
        const isConnected = !!cacheConnectionsWAOnline.get(connectionWAId);
        return {
          ...r,
          status: !!isConnected ? "open" : "close",
          businesses: AgentAIOnBusiness.map((item) => item.Business),
        };
      } else {
        return {
          ...r,
          status: "close",
          businesses: AgentAIOnBusiness.map((item) => item.Business),
        };
      }
    });

    return {
      message: "OK!",
      status: 200,
      agentsAI,
    };
  }
}

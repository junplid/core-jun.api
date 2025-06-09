import { GetAgentsAIDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetAgentsAIUseCase {
  constructor() {}

  async run(dto: GetAgentsAIDTO_I) {
    const data = await prisma.agentAI.findMany({
      where: { accountId: dto.accountId },
      select: {
        id: true,
        name: true,
        createAt: true,
        AgentAIOnBusiness: {
          select: { Business: { select: { id: true, name: true } } },
        },
      },
    });

    return {
      message: "OK!",
      status: 200,
      agentsAI: data.map(({ AgentAIOnBusiness, ...r }) => ({
        ...r,
        businesses: AgentAIOnBusiness.map((item) => item.Business),
      })),
    };
  }
}

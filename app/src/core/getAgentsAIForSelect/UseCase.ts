import { GetAgentsAIForSelectDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

function pickExistNode(text: string) {
  const math = text.match(/\/\[sair_node,\s(.+)\]/g);
  if (!math) return [];
  return math.map((s) => s.replace(/\/\[sair_node,\s(.+)\]/, "$1"));
}

export class GetAgentsAIForSelectUseCase {
  constructor() {}

  async run(dto: GetAgentsAIForSelectDTO_I) {
    const agentsAI = await prisma.agentAI.findMany({
      where: {
        ...(dto.businessIds?.length && {
          AgentAIOnBusiness: { some: { businessId: { in: dto.businessIds } } },
        }),
        ...(dto.name && { name: { contains: dto.name } }),
      },
      orderBy: { id: "desc" },
      select: { name: true, id: true, instructions: true },
    });

    const nextAgents = agentsAI.map(({ instructions, ...agent }) => {
      return {
        ...agent,
        exitNodes: pickExistNode(instructions || ""),
      };
    });

    return { message: "OK!", status: 200, agentsAI: nextAgents };
  }
}

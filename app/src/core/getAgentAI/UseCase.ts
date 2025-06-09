import { GetAgentAIDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetAgentAIUseCase {
  constructor() {}

  async run(dto: GetAgentAIDTO_I) {
    const data = await prisma.agentAI.findFirst({
      where: dto,
      select: {
        name: true,
        model: true,
        emojiLevel: true,
        knowledgeBase: true,
        language: true,
        temperature: true,
        personality: true,
        providerCredentialId: true,
        AgentAIOnBusiness: { select: { businessId: true } },
        InstructionOnAgentAI: {
          select: {
            prompt: true,
            promptAfterReply: true,
            StoragePathOnInstructionOnAgentAI: {
              select: {
                StoragePaths: {
                  select: {
                    id: true,
                    fileName: true,
                    originalName: true,
                    mimetype: true,
                  },
                },
              },
            },
          },
        },
        StoragePathsOnAgentAI: {
          select: {
            StoragePaths: {
              select: {
                id: true,
                fileName: true,
                originalName: true,
                mimetype: true,
              },
            },
          },
        },
      },
    });

    if (!data) {
      throw new ErrorResponse(400).container("Agente IA não encontrado.");
    }

    const {
      AgentAIOnBusiness,
      InstructionOnAgentAI,
      StoragePathsOnAgentAI,
      ...rest
    } = data;

    return {
      message: "OK!",
      status: 200,
      agentAI: {
        ...rest,
        businessIds: AgentAIOnBusiness.map((item) => item.businessId),
        instructions: InstructionOnAgentAI.map(
          ({ StoragePathOnInstructionOnAgentAI, ...r }) => ({
            ...r,
            files: StoragePathOnInstructionOnAgentAI.map(
              (item) => item.StoragePaths
            ),
          })
        ),
        files: StoragePathsOnAgentAI.map((item) => item.StoragePaths),
      },
    };
  }
}

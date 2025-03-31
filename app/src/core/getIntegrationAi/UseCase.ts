import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetIntegrationAiDTO_I } from "./DTO";

export class GetIntegrationAiUseCase {
  constructor() {}

  async run(dto: GetIntegrationAiDTO_I) {
    try {
      const findIntegrationAI = await prisma.artificialIntelligence.findUnique({
        where: dto,
        include: {
          ArtificialIntelligenceOnBusiness: {
            select: {
              businessId: true,
            },
          },
        },
      });

      if (!findIntegrationAI) {
        throw new ErrorResponse(400).toast({
          title: `Integração IA não foi encontrada`,
          type: "error",
        });
      }

      const {
        accountId,
        createAt,
        updateAt,
        ArtificialIntelligenceOnBusiness,
        id,
        ...integrationAI
      } = findIntegrationAI;

      return {
        message: "OK!",
        status: 200,
        integrationAI: {
          ...integrationAI,
          temperature: integrationAI.temperature?.toNumber() || null,
          businessIds: ArtificialIntelligenceOnBusiness.map(
            (s) => s.businessId
          ),
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar buscar integração IA`,
        type: "error",
      });
    }
  }
}

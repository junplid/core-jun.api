import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetIntegrationAiDetailsDTO_I } from "./DTO";

export class GetIntegrationAiDetailsUseCase {
  constructor() {}

  async run(dto: GetIntegrationAiDetailsDTO_I) {
    try {
      const findIntegrationAI = await prisma.artificialIntelligence.findUnique({
        where: dto,
        include: {
          ArtificialIntelligenceOnBusiness: {
            select: { Business: { select: { name: true, id: true } } },
          },
        },
      });

      if (!findIntegrationAI) {
        throw new ErrorResponse(400).toast({
          title: `Integração não foi encontrada`,
          type: "error",
        });
      }

      const {
        accountId,
        id,
        ArtificialIntelligenceOnBusiness,
        ...integrationIA
      } = findIntegrationAI;

      return {
        message: "OK!",
        status: 200,
        integrationAI: {
          ...integrationIA,
          business: ArtificialIntelligenceOnBusiness.map((s) => s.Business),
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar buscar integração`,
        type: "error",
      });
    }
  }
}

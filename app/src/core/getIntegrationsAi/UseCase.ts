import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetIntegrationsAiDTO_I } from "./DTO";

export class GetIntegrationsAiUseCase {
  constructor() {}

  async run(dto: GetIntegrationsAiDTO_I) {
    try {
      const findIntegrationAI = await prisma.artificialIntelligence.findMany({
        where: dto,
        select: {
          name: true,
          ArtificialIntelligenceOnBusiness: {
            select: { Business: { select: { name: true } } },
          },
          createAt: true,
          type: true,
          id: true,
        },
      });

      if (!findIntegrationAI) {
        throw new ErrorResponse(400).toast({
          title: `Integração ia não foi encontrada`,
          type: "error",
        });
      }

      const integrationsAI = findIntegrationAI.map(
        ({ ArtificialIntelligenceOnBusiness, ...s }) => ({
          ...s,
          business: ArtificialIntelligenceOnBusiness.map(
            (dd) => dd.Business.name
          ).join(", "),
        })
      );

      return { message: "OK!", status: 200, integrationsAI };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ai tentar buscar integrações ia`,
        type: "error",
      });
    }
  }
}

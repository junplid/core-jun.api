import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetIntegrationAiForSelectDTO_I } from "./DTO";

export class GetIntegrationAiForSelectUseCase {
  constructor() {}

  async run(dto: GetIntegrationAiForSelectDTO_I) {
    try {
      const integrationsAI = await prisma.artificialIntelligence.findMany({
        where: {
          ...(dto.businessIds?.length && {
            ArtificialIntelligenceOnBusiness: {
              some: { businessId: { in: dto.businessIds } },
            },
          }),
          accountId: dto.accountId,
          name: dto.name,
        },
        select: { name: true, id: true },
      });

      return { message: "OK!", status: 200, integrationsAI };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ai tentar buscar integrações`,
        type: "error",
      });
    }
  }
}

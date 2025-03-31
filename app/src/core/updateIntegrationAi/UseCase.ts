import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateIntegrationAiDTO_I } from "./DTO";

export class UpdateIntegrationAiUseCase {
  constructor() {}

  async run({ accountId, id, businessIds, ...dto }: UpdateIntegrationAiDTO_I) {
    const exist = await prisma.artificialIntelligence.findFirst({
      where: { accountId, id },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Integração IA não foi encontrada`,
        type: "error",
      });
    }

    try {
      const { ArtificialIntelligenceOnBusiness } =
        await prisma.artificialIntelligence.update({
          where: { id },
          data: {
            ...dto,
            ...(businessIds?.length && {
              ArtificialIntelligenceOnBusiness: {
                deleteMany: { aiId: id },
                createMany: {
                  data: businessIds.map((businessId) => ({ businessId })),
                },
              },
            }),
          },
          select: {
            ArtificialIntelligenceOnBusiness: {
              select: { Business: { select: { name: true } } },
            },
          },
        });

      return {
        message: "OK!",
        status: 200,
        integrationAI: {
          business: ArtificialIntelligenceOnBusiness.map(
            (s) => s.Business.name
          ).join(", "),
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar Integração IA`,
        type: "error",
      });
    }
  }
}

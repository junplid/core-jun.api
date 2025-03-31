import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateIntegrationAiDTO_I } from "./DTO";

export class CreateIntegrationAiUseCase {
  constructor() {}

  async run({ accountId, businessIds, ...dto }: CreateIntegrationAiDTO_I) {
    const exist = await prisma.artificialIntelligence.findFirst({
      where: {
        name: dto.name,
        accountId,
        ArtificialIntelligenceOnBusiness: {
          some: { businessId: { in: businessIds } },
        },
      },
    });

    if (exist) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: `Integração IA já existente`,
      });
    }

    const { ArtificialIntelligenceOnBusiness, ...integrationAI } =
      await prisma.artificialIntelligence.create({
        data: {
          ...dto,
          accountId,
          ArtificialIntelligenceOnBusiness: {
            createMany: {
              data: businessIds.map((businessId) => ({ businessId })),
            },
          },
        },
        select: {
          id: true,
          ArtificialIntelligenceOnBusiness: {
            select: { Business: { select: { name: true } } },
          },
          createAt: true,
        },
      });

    return {
      message: "OK!",
      status: 201,
      integrationAI: {
        ...integrationAI,
        business: ArtificialIntelligenceOnBusiness.map(
          (s) => s.Business.name
        ).join(", "),
      },
    };
  }
}

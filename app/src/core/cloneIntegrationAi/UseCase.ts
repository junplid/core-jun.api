import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateCloneintegrationAiDTO_I } from "./DTO";

export class CreateCloneintegrationAiUseCase {
  constructor() {}

  async run({ accountId, id: idOrigin }: CreateCloneintegrationAiDTO_I) {
    const exist = await prisma.artificialIntelligence.findFirst({
      where: { id: idOrigin, accountId },
      include: {
        ArtificialIntelligenceOnBusiness: {
          select: { businessId: true },
        },
      },
    });

    if (!exist?.id) {
      throw new ErrorResponse(400).toast({
        title: "Integração IA não encontrada",
        type: "error",
      });
    }

    const {
      id,
      updateAt,
      createAt,
      ArtificialIntelligenceOnBusiness,
      ...rest
    } = exist;

    const name = `COPIA_${new Date().getTime()}_${exist.name}`;

    try {
      const { ArtificialIntelligenceOnBusiness: Businesses, ...integrationAI } =
        await prisma.artificialIntelligence.create({
          data: {
            ...rest,
            name,
            ArtificialIntelligenceOnBusiness: {
              createMany: { data: ArtificialIntelligenceOnBusiness },
            },
          },
          select: {
            id: true,
            name: true,
            createAt: true,
            ArtificialIntelligenceOnBusiness: {
              select: { Business: { select: { name: true } } },
            },
          },
        });
      return {
        message: "OK!",
        status: 200,
        integrationAI: {
          ...integrationAI,
          business: Businesses.map((s) => s.Business.name).join(", "),
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: "Erro ao tentar clonar integração IA",
        type: "error",
      });
    }
  }
}

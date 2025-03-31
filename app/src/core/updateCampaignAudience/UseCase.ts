import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateCampaignAudienceDTO_I } from "./DTO";

export class UpdateCampaignAudienceUseCase {
  constructor() {}

  async run({
    accountId,
    id,
    businessIds,
    tagOnBusinessId,
    ...dto
  }: UpdateCampaignAudienceDTO_I) {
    const exist = await prisma.audience.findFirst({
      where: { accountId, id },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Público não encontrado`,
        type: "error",
      });
    }

    try {
      const { TagOnBusinessOnAudience, AudienceOnBusiness } =
        await prisma.audience.update({
          where: { id },
          data: {
            ...dto,
            ...(businessIds?.length && {
              AudienceOnBusiness: {
                deleteMany: { campaignAudienceId: id },
                createMany: {
                  data: businessIds.map((businessId) => ({ businessId })),
                },
              },
            }),
            ...(tagOnBusinessId !== undefined && {
              TagOnBusinessOnAudience: {
                deleteMany: { campaignAudienceId: id },
                ...(tagOnBusinessId.length && {
                  createMany: {
                    data: tagOnBusinessId.map((tagOnBusinessId) => ({
                      tagOnBusinessId,
                    })),
                  },
                }),
              },
            }),
          },
          select: {
            TagOnBusinessOnAudience: {
              select: {
                TagOnBusiness: {
                  select: { Business: { select: { name: true } } },
                },
              },
            },
            AudienceOnBusiness: {
              select: {
                Business: { select: { name: true } },
              },
            },
          },
        });

      return {
        message: "OK!",
        status: 200,
        audience: {
          business: AudienceOnBusiness.map((s) => s.Business.name).join(", "),
          tags: TagOnBusinessOnAudience.map(
            (s) => s.TagOnBusiness.Business.name
          ).join(", "),
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar Público`,
        type: "error",
      });
    }
  }
}

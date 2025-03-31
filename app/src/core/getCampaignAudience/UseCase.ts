import { GetCampaignAudienceDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetCampaignAudienceUseCase {
  constructor() {}

  async run(dto: GetCampaignAudienceDTO_I) {
    const audience = await prisma.audience.findFirst({
      where: dto,
      select: {
        name: true,
        TagOnBusinessOnAudience: { select: { tagOnBusinessId: true } },
        type: true,
        AudienceOnBusiness: { select: { businessId: true } },
      },
    });

    if (!audience) {
      throw new ErrorResponse(400).toast({
        title: `Público não foi encontrado!`,
        type: "error",
      });
    }
    const { AudienceOnBusiness, TagOnBusinessOnAudience, ...rest } = audience;
    return {
      message: "OK!",
      status: 200,
      audience: {
        ...rest,
        businessIds: AudienceOnBusiness.map(({ businessId }) => businessId),
        tagOnBusinessId: TagOnBusinessOnAudience.map(
          ({ tagOnBusinessId }) => tagOnBusinessId
        ),
      },
    };
  }
}

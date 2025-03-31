import { GetCampaignAudienceDetailsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetCampaignAudienceDetailsUseCase {
  constructor() {}

  async run(dto: GetCampaignAudienceDetailsDTO_I) {
    const audience = await prisma.audience.findFirst({
      where: dto,
      select: {
        _count: { select: { ContactsWAOnAccountOnAudience: true } },
        name: true,
        TagOnBusinessOnAudience: {
          select: {
            TagOnBusiness: {
              select: { Tag: { select: { name: true, id: true } } },
            },
          },
        },
        type: true,
        AudienceOnBusiness: {
          select: { Business: { select: { name: true, id: true } } },
        },
      },
    });

    if (!audience) {
      throw new ErrorResponse(400).toast({
        title: `Público não foi encontrado!`,
        type: "error",
      });
    }
    const { AudienceOnBusiness, TagOnBusinessOnAudience, _count, ...rest } =
      audience;
    return {
      message: "OK!",
      status: 200,
      audience: {
        ...rest,
        business: AudienceOnBusiness.map(({ Business }) => Business),
        tagOnBusiness: TagOnBusinessOnAudience.map(
          ({ TagOnBusiness }) => TagOnBusiness.Tag
        ),
        countContacts: _count.ContactsWAOnAccountOnAudience,
      },
    };
  }
}

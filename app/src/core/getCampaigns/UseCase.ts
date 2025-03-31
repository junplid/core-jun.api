import { GetCampaignsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetCampaignsUseCase {
  constructor() {}

  async run(dto: GetCampaignsDTO_I) {
    const campaigns = await prisma.campaign.findMany({
      where: {
        accountId: dto.accountId,
        ...(dto.isOndemand !== undefined && {
          isOndemand: !!dto.isOndemand,
        }),
      },
      select: {
        id: true,
        name: true,
        createAt: true,
        status: true,
        CampaignOnBusiness: {
          select: { Business: { select: { name: true } } },
        },
      },
    });

    const nextC = campaigns.map(({ CampaignOnBusiness, ...c }) => ({
      ...c,
      business: CampaignOnBusiness.map((s) => s.Business.name).join(", "),
    }));

    return {
      message: "OK!",
      status: 200,
      campaigns: nextC,
    };
  }
}

import { GetCampaignDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetCampaignUseCase {
  constructor() {}

  async run(dto: GetCampaignDTO_I) {
    const findCampaigns = await prisma.campaign.findFirst({
      where: dto,
      select: {
        name: true,
        flowId: true,
        description: true,
        shootingSpeedId: true,
        timeItWillStart: true,
        HasTag_Campaign: { select: { tagId: true } },
        CampaignOnBusiness: { select: { businessId: true } },
        ConnectionOnCampaign: { select: { connectionWAId: true } },
        OperatingDays: {
          select: {
            dayOfWeek: true,
            WorkingTimes: { select: { start: true, end: true } },
          },
        },
      },
    });
    if (!findCampaigns) {
      throw new ErrorResponse(400).container("Campanha não encontrada!");
    }

    const {
      CampaignOnBusiness,
      ConnectionOnCampaign,
      HasTag_Campaign,
      OperatingDays,
      ...rest
    } = findCampaigns;

    return {
      message: "OK!",
      status: 200,
      campaign: {
        ...rest,
        businessIds: CampaignOnBusiness.map((cb) => cb.businessId),
        connectionIds: ConnectionOnCampaign.map((cc) => cc.connectionWAId),
        tagsIds: HasTag_Campaign.map((ht) => ht.tagId),
        operatingDays: OperatingDays.map((od) => ({
          dayOfWeek: od.dayOfWeek,
          workingTimes: od.WorkingTimes.map((wt) => ({
            start: wt.start,
            end: wt.end,
          })),
        })),
      },
    };
  }
}

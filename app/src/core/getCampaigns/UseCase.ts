import { GetCampaignsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { TypeStatusCampaign } from "@prisma/client";
import moment from "moment";

export class GetCampaignsUseCase {
  constructor() {}

  async run(dto: GetCampaignsDTO_I) {
    const findCampaigns = await prisma.campaign.findMany({
      where: { accountId: dto.accountId },
      orderBy: { id: "desc" },
      select: {
        name: true,
        id: true,
        status: true,
        CampaignOnBusiness: {
          select: { Business: { select: { id: true, name: true } } },
        },
        FlowState: { select: { isFinish: true, isSent: true } },
        createAt: true,
      },
    });

    const campaigns = findCampaigns.map((campaign) => {
      const { CampaignOnBusiness, FlowState, ...rest } = campaign;
      const totalFlows = FlowState.length;
      const sentCount = FlowState.filter((fs) => fs.isSent).length;
      const finishCount = FlowState.filter((fs) => fs.isFinish).length;
      const sentPercentage =
        totalFlows > 0 ? (sentCount / totalFlows) * 100 : 0;
      const finishPercentage =
        totalFlows > 0 ? (finishCount / totalFlows) * 100 : 0;

      return {
        ...rest,
        businesses: CampaignOnBusiness.map((cb) => ({
          id: cb.Business.id,
          name: cb.Business.name,
        })),
        finishPercentage,
        sentPercentage,
        totalFlows,
      };
    });

    return { message: "OK!", status: 200, campaigns };
  }
}

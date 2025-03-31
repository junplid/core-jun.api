import { GetCampaignOndemandDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { TypeStatusCampaign } from "@prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

const statuss: { [x in TypeStatusCampaign]: boolean } = {
  finished: false,
  paused: false,
  processing: true,
  running: true,
  stopped: false,
};

export class GetCampaignOndemandUseCase {
  constructor() {}

  async run(dto: GetCampaignOndemandDTO_I) {
    const campp = await prisma.campaign.findFirst({
      where: { id: dto.id, accountId: dto.accountId },
      orderBy: { id: "desc" },
      select: {
        status: true,
        name: true,
        description: true,
        flowId: true,
        AudienceOnCampaign: { take: 1, select: { audienceId: true } },
        CampaignOnBusiness: {
          select: {
            businessId: true,
            ConnectionOnCampaign: { select: { connectionOnBusinessId: true } },
          },
        },
      },
    });

    if (!campp) {
      throw new ErrorResponse(400).toast({
        title: `Campanha não foi encontrada!`,
        type: "error",
      });
    }
    const { CampaignOnBusiness, AudienceOnCampaign, ...rest } = campp;

    try {
      const connectionOnBusinessIds = CampaignOnBusiness.map((s) => {
        const list = s?.ConnectionOnCampaign?.map(
          (v) => v.connectionOnBusinessId
        );
        return list?.length ? list : [];
      }).flat();

      return {
        message: "OK!",
        status: 200,
        campaign: {
          ...rest,
          status: statuss[rest.status],
          audienceId: AudienceOnCampaign[0].audienceId,
          businessIds: CampaignOnBusiness.map((s) => s.businessId),
          ...(connectionOnBusinessIds?.length && { connectionOnBusinessIds }),
        },
      };
    } catch (error) {
      console.log(error);
    }
  }
}

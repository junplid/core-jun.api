import { GetCampaignDetailsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetCampaignDetailsUseCase {
  constructor() {}

  async run(dto: GetCampaignDetailsDTO_I) {
    const findCampaigns = await prisma.campaign.findFirst({
      where: dto,
      select: {
        name: true,
        id: true,
        description: true,
        status: true,
        CampaignOnBusiness: {
          select: { Business: { select: { id: true, name: true } } },
        },
        ConnectionOnCampaign: {
          select: {
            ConnectionWA: {
              select: {
                name: true,
                number: true,
                id: true,
                type: true,
                countShots: true,
              },
            },
          },
        },
        createAt: true,
        updateAt: true,
      },
    });
    if (!findCampaigns) {
      throw new ErrorResponse(400).container("Campanha não encontrada!");
    }

    const { CampaignOnBusiness, ConnectionOnCampaign, ...rest } = findCampaigns;

    return {
      message: "OK!",
      status: 200,
      campaign: {
        ...rest,
        businesses: CampaignOnBusiness.map((cb) => ({
          id: cb.Business.id,
          name: cb.Business.name,
        })),
        connections: ConnectionOnCampaign.map((cc) => cc.ConnectionWA),
      },
    };
  }
}

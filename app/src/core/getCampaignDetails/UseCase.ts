import { GetCampaignDetailsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetCampaignDetailsUseCase {
  constructor() {}

  async run(dto: GetCampaignDetailsDTO_I) {
    const campp = await prisma.campaign.findFirst({
      where: { id: dto.id, accountId: dto.accountId, isOndemand: false },
      orderBy: { id: "desc" },
      select: {
        name: true,
        description: true,
        status: true,
        flowId: true,
        CampaignParameter: { select: { id: true, name: true } },
        CampaignOnBusiness: {
          select: {
            Business: { select: { name: true, id: true } },
            ConnectionOnCampaign: {
              select: {
                ConnectionOnBusiness: { select: { name: true, id: true } },
              },
            },
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
    const { CampaignOnBusiness, CampaignParameter, ...rest } = campp;

    const listConn = CampaignOnBusiness.map((s) =>
      s.ConnectionOnCampaign.map((d) => d.ConnectionOnBusiness)
    ).flat();

    const connections = await Promise.all(
      listConn.map(async ({ id, name }) => {
        try {
          if (!id) return null;
          const isConnected = sessionsBaileysWA
            .get(id)
            ?.ev.emit("connection.update", { connection: "open" });
          return { id, name, status: !!isConnected };
        } catch (error) {
          if (!id) return null;
          return { id, name: name, status: false };
        }
      })
    );

    return {
      message: "OK!",
      status: 200,
      campaign: {
        ...rest,
        parameter: CampaignParameter,
        business: CampaignOnBusiness.map((s) => s.Business),
        connections,
      },
    };
  }
}

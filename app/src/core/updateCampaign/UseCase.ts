import { UpdateCampaignDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class UpdateCampaignUseCase {
  constructor() {}

  async run({
    id,
    accountId,
    businessIds,
    connectionOnBusinessIds,
    status,
    audienceIds,
    denial,
    ...dto
  }: UpdateCampaignDTO_I) {
    const campaign = prisma.campaign.findFirst({
      where: { id, accountId },
    });

    if (!campaign) {
      throw new ErrorResponse(400).toast({
        title: `Campanha não foi encontrada`,
        type: "error",
      });
    }

    let validConnections: (number | null)[] = [];

    if (connectionOnBusinessIds?.length) {
      validConnections = await Promise.all(
        connectionOnBusinessIds.map(async (connectionOnBusinessId) => {
          const isValid = await prisma.connectionOnBusiness.count({
            where: { id: connectionOnBusinessId, Business: { accountId } },
          });
          return isValid ? connectionOnBusinessId : null;
        })
      );
    }

    if (validConnections.includes(null)) {
      throw new ErrorResponse(400).input({
        path: "connectionOnBusinessIds",
        text: `Há algumas conexões invalidas`,
      });
    }

    if (validConnections.length) {
      const connectionsBeingUsed = await prisma.connectionOnCampaign.count({
        where: {
          ConnectionOnBusiness: { id: { in: connectionOnBusinessIds } },
          CampaignOnBusiness: {
            Campaign: {
              status: { in: ["paused", "processing", "running"] },
            },
            Business: { accountId },
          },
        },
      });

      if (connectionsBeingUsed) {
        throw new ErrorResponse(400).input({
          path: "connectionOnBusinessIds",
          text: `Algumas dessas conexões já estão sendo usadas`,
        });
      }
    }

    try {
      const { CampaignOnBusiness, denialCampaignId, ...rest } =
        await prisma.campaign.update({
          where: { id },
          data: {
            ...dto,
            ...(status !== undefined && {
              status: status ? "running" : "stopped",
            }),
            ...(businessIds?.length && {
              CampaignOnBusiness: {
                deleteMany: { CampaignId: id },
                createMany: {
                  data: businessIds.map((businessId) => ({ businessId })),
                },
              },
            }),
            ...(audienceIds?.length && {
              AudienceOnCampaign: {
                deleteMany: { campaignId: id },
                createMany: {
                  data: audienceIds.map((audienceId) => ({ audienceId })),
                },
              },
            }),
          },
          select: {
            status: true,
            CampaignOnBusiness: {
              select: { Business: { select: { name: true } } },
            },
            denialCampaignId: true,
          },
        });

      if (denial && denialCampaignId) {
        await prisma.denialCampaign.update({
          where: { id: denialCampaignId },
          data: denial,
        });
      } else if (denial && !denialCampaignId) {
        await prisma.denialCampaign.create({ data: denial });
      }

      if (validConnections?.length) {
        await prisma.connectionOnCampaign.deleteMany({
          where: { CampaignOnBusiness: { CampaignId: id } },
        });
        const businessCIds = await prisma.campaign.findFirst({
          where: { id, accountId },
          select: { CampaignOnBusiness: { select: { id: true } } },
        });
        if (!businessCIds?.CampaignOnBusiness) {
          throw new ErrorResponse(400).toast({
            title: `Error na busca pelo negocio da campanha`,
            type: "error",
          });
        }
        (validConnections as number[]).forEach(
          async (connectionOnBusinessId) => {
            businessCIds.CampaignOnBusiness.forEach(async ({ id: cBusId }) => {
              await prisma.connectionOnCampaign.create({
                data: { campaignOnBusinessId: cBusId, connectionOnBusinessId },
              });
            });
          }
        );
      }

      return {
        message: "OK!",
        status: 200,
        campaign: {
          ...rest,
          business: CampaignOnBusiness.map((s) => s.Business.name).join(", "),
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Não foi possivel atualizar campanha`,
        type: "error",
      });
    }
  }
}

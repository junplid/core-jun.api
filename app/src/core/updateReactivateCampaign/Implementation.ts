import { Prisma, PrismaClient } from "@prisma/client";
import { UpdateReactivateCampaignRepository_I } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class UpdateReactivateCampaignImplementation
  implements UpdateReactivateCampaignRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async startCampaign(data: { campaignId: number }): Promise<void> {
    try {
      await this.prisma.campaign.update({
        where: { id: data.campaignId },
        data: { status: "running" },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  async fetchCampaign(props: { id: number; accountId: number }): Promise<{
    name: string;
    flowId: string;
    business: { businessId: number; connections: number[] }[];
  } | null> {
    try {
      const data = await this.prisma.campaign.findUnique({
        where: {
          id: props.id,
          accountId: props.accountId,
          status: {
            in: ["paused", "stopped", "finished"],
          },
        },
        select: {
          name: true,
          flowId: true,
          CampaignOnBusiness: {
            select: {
              businessId: true,
              ConnectionOnCampaign: {
                select: { connectionOnBusinessId: true },
              },
            },
          },
        },
      });

      if (!data) return null;

      const business = data.CampaignOnBusiness.map((s) => {
        return {
          businessId: s.businessId,
          connections: s.ConnectionOnCampaign.map(
            (v) => v.connectionOnBusinessId
          ),
        };
      });

      const { CampaignOnBusiness, ...rest } = data;
      return {
        business,
        ...rest,
      };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

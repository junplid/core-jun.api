import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import {
  CloneCampaignOndemandRepository_I,
  PropsCloneCampaignOndemand,
} from "./Repository";

export class CraeteCampaignImplementation
  implements CloneCampaignOndemandRepository_I
{
  constructor(
    private prisma: PrismaClient<
      Prisma.PrismaClientOptions,
      never,
      DefaultArgs
    >,
    private flowDb = ModelFlows
  ) {}

  async fetchExistConnectionOnBusiness(data: {
    connectionOnBusinessId: number;
    accountId: number;
  }): Promise<number> {
    try {
      return await this.prisma.connectionOnBusiness.count({
        where: {
          id: data.connectionOnBusinessId,
          Business: {
            accountId: data.accountId,
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  async fetchCampaignOnConnections(data: {
    connectionOnBusinessIds: number[];
    accountId: number;
  }): Promise<number> {
    try {
      return await this.prisma.connectionOnCampaign.count({
        where: {
          ConnectionOnBusiness: {
            id: { in: data.connectionOnBusinessIds },
          },
          CampaignOnBusiness: {
            Campaign: {
              OR: [
                { status: "paused" },
                { status: "processing" },
                { status: "running" },
              ],
            },
            Business: { accountId: data.accountId },
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  async fetchExistFlow(data: {
    flowId: number;
    accountId: number;
  }): Promise<number> {
    try {
      const flow = await this.flowDb
        .find({ _id: data.flowId, accountId: data.accountId })
        .count();
      return flow;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  async createCampaignOndemand(data: PropsCloneCampaignOndemand): Promise<{
    readonly id: number;
    readonly createAt: Date;
    readonly campaignOnBusinessIds: number[];
    readonly business: string;
  }> {
    try {
      const { CampaignOnBusiness, ...rest } = await this.prisma.campaign.create(
        {
          data: {
            flowId: data.flowId,
            name: data.name,
            accountId: data.accountId,
            description: data.description,
            isOndemand: true,
            status: "stopped",
            CampaignOnBusiness: {
              createMany: {
                data: data.businessIds.map((businessId) => ({ businessId })),
              },
            },
            AudienceOnCampaign: { create: { audienceId: data.audienceId } },
          },
          select: {
            id: true,
            createAt: true,
            CampaignOnBusiness: {
              select: { id: true, Business: { select: { name: true } } },
            },
          },
        }
      );

      return {
        ...rest,
        business: CampaignOnBusiness.map((c) => c.Business.name).join(", "),
        campaignOnBusinessIds: CampaignOnBusiness.map((c) => c.id),
      };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  async createConnectionOnCampaign(data: {
    readonly campaignOnBusinessId: number;
    readonly connectionOnBusinessId: number;
  }): Promise<void> {
    try {
      await this.prisma.connectionOnCampaign.create({
        data,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  async fetchExistCampaignWithThisName(props: {
    name: string;
    accountId: number;
    businessIds: number[];
  }): Promise<number> {
    try {
      return await this.prisma.campaign.count({
        where: {
          name: props.name,
          accountId: props.accountId,
          CampaignOnBusiness: {
            some: {
              OR: props.businessIds.map((businessId) => ({ businessId })),
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

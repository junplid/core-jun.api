import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { CloneCampaignRepository_I, PropsCloneCampaign } from "./Repository";

export class CraeteCampaignImplementation implements CloneCampaignRepository_I {
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
    flowId: string;
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

  async fetchAllContactsOfAudience(
    audienceIds: number[]
  ): Promise<{ id: number; completeNumber: string }[][]> {
    try {
      const data = await this.prisma.contactsWAOnAccount.findMany({
        where: {
          ContactsWAOnAccountOnAudience: {
            some: { audienceId: { in: audienceIds } },
          },
        },
        select: {
          ContactsWA: {
            select: {
              completeNumber: true,
            },
          },
          ContactsWAOnAccountOnAudience: {
            select: {
              id: true,
            },
          },
        },
      });

      return data.map(({ ContactsWAOnAccountOnAudience, ContactsWA }) =>
        ContactsWAOnAccountOnAudience.map((e) => ({
          id: e.id,
          completeNumber: ContactsWA.completeNumber,
        }))
      );
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  async createCampaignOndemand(data: PropsCloneCampaign): Promise<{
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
            isOndemand: false,
            campaignParameterId: data.campaignParameterId,
            status: "stopped",
            CampaignOnBusiness: {
              createMany: {
                data: data.businessIds.map((businessId) => ({ businessId })),
              },
            },
            AudienceOnCampaign: {
              createMany: {
                data: data.audienceIds.map((audienceId) => ({ audienceId })),
              },
            },
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

      if (data.DenialCampaign) {
        await this.prisma.denialCampaign.create({
          data: {
            ...data.DenialCampaign,
            Campaign: { connect: { id: rest.id } },
          },
        });
      }

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

  async createAudienceOnCampaign(datas: {
    campaignId: number;
    contactsWAOnAccountOnAudienceIds: number[];
  }): Promise<void> {
    try {
      await this.prisma.flowState.createMany({
        data: datas.contactsWAOnAccountOnAudienceIds.map(
          (contactsWAOnAccountOnAudienceId) => ({
            campaignId: datas.campaignId,
            contactsWAOnAccountOnAudienceId,
            type: "campaign",
          })
        ),
      });
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

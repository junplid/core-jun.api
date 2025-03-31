import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { CreateCampaignRepository_I, PropsCreateCampaign } from "./Repository";

export class CraeteCampaignImplementation
  implements CreateCampaignRepository_I
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

  async fetchExistParameter(data: {
    campaignParameterId: number;
    accountId: number;
  }): Promise<number> {
    try {
      return await this.prisma.campaignParameter.count({
        where: {
          id: data.campaignParameterId,
          accountId: data.accountId,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  async fetchExistAudience(data: {
    audienceId: number;
    accountId: number;
  }): Promise<number> {
    try {
      return await this.prisma.audience.count({
        where: { id: data.audienceId },
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

  async createDenial(data: {
    whoHasTag?: string;
    whoAnsweredConnection?: string;
    whoIsInFlow?: string;
    whoIsInCampaign?: string;
    whoReceivedMessageBefore?: string;
  }): Promise<{
    readonly denialCampaignId: number;
  }> {
    try {
      const denialCampaign = await this.prisma.denialCampaign.create({
        data,
        select: { id: true },
      });
      return { denialCampaignId: denialCampaign.id };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  // async fetchContactsWAOnAudiencesMerge(data: {
  //   campaignAudienceId: number[];
  //   accountId: number;
  // }): Promise<{ readonly contactWAOnAccountId: number[] }> {
  //   try {
  //     const contactsWA = await this.prisma.contactsWAOnAccount.findMany({
  //       where: {
  //         accountId: data.accountId,
  //         ContactsWAOnAccountOnAudience: {
  //           some: {
  //             OR: data.campaignAudienceId.map((campaignAudienceId) => ({
  //               campaignAudienceId,
  //             })),
  //           },
  //         },
  //       },
  //       select: { id: true },
  //     });
  //     return { contactWAOnAccountId: contactsWA.map((c) => c.id) };
  //   } catch (error) {
  //     console.log(error);
  //     throw new Error("Erro `Create Account Asset Data`.");
  //   }
  // }

  // async createCampaignAudience(data: {
  //   name: string;
  //   accountId: number;
  //   contactWAOnAccountId: number[];
  // }): Promise<{
  //   readonly campaignAudienceId: number;
  //   contactsWAOnAccountOnCampaignAudienceIds: number[];
  // }> {
  //   try {
  //     const campaignAudience = await this.prisma.campaignAudience.create({
  //       data: {
  //         accountId: data.accountId,
  //         name: data.name,
  //         type: "static",
  //         ContactsWAOnAccountOnCampaignAudience: {
  //           createMany: {
  //             data: data.contactWAOnAccountId.map((contactWAOnAccountId) => ({
  //               contactWAOnAccountId,
  //             })),
  //           },
  //         },
  //       },
  //       select: {
  //         id: true,
  //         ContactsWAOnAccountOnCampaignAudience: {
  //           select: {
  //             id: true,
  //           },
  //         },
  //       },
  //     });
  //     return {
  //       campaignAudienceId: campaignAudience.id,
  //       contactsWAOnAccountOnCampaignAudienceIds:
  //         campaignAudience.ContactsWAOnAccountOnCampaignAudience.map(
  //           (cabca) => cabca.id
  //         ),
  //     };
  //   } catch (error) {
  //     console.log(error);
  //     throw new Error("Erro `Create Account Asset Data`.");
  //   }
  // }

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

  async createAudienceOnCampaign(datas: {
    campaignId: number;
    contactsWAOnAccountOnAudienceIds: number[];
  }): Promise<void> {
    try {
      await this.prisma.flowState.createMany({
        data: datas.contactsWAOnAccountOnAudienceIds.map(
          (contactsWAOnAccountOnAudienceId) => {
            return {
              campaignId: datas.campaignId,
              contactsWAOnAccountOnAudienceId,
              type: "campaign",
              isSent: false,
              isFinish: false,
              indexNode: "0",
            };
          }
        ),
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

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

  async createCampaign(data: PropsCreateCampaign): Promise<{
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
            ...(data.isOndemand === false
              ? {
                  description: data.description,
                  status: "processing",
                  isOndemand: data.isOndemand,
                  timeToStart: data.timeToStart,
                  campaignParameterId: data.campaignParameterId,
                  ...(data.denialCampaignId && {
                    denialCampaignId: data.denialCampaignId,
                  }),
                  AudienceOnCampaign: {
                    createMany: {
                      data: data.audienceIds.map((audienceId) => ({
                        audienceId,
                      })),
                    },
                  },
                }
              : {
                  description: data.description,
                  isOndemand: true,
                  status: "running",
                  AudienceOnCampaign: {
                    createMany: {
                      data: data.audienceIds.map((audienceId) => ({
                        audienceId,
                      })),
                    },
                  },
                }),

            CampaignOnBusiness: {
              createMany: {
                data: data.businessIds.map((businessId) => ({ businessId })),
              },
            },
          },
          select: {
            id: true,
            createAt: true,
            CampaignOnBusiness: {
              select: {
                id: true,
                Business: {
                  select: {
                    name: true,
                  },
                },
              },
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

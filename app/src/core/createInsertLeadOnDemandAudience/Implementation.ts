import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import {
  CreateInsertLeadOnDemandAudienceRepository_I,
  PropsConnectContactsWAExistingToNewContactsOnAccount,
  PropsConnectTagOnBusinessToContactsWAOnAccount,
  PropsConnectVariablesOnBusinessToContactsWAOnAccount,
  PropsCreate,
  PropsCreateContactsWAAndContactsOnAccount,
  PropsFetchExist,
} from "./Repository";

export class CreateInsertLeadOnDemandAudienceImplementation
  implements CreateInsertLeadOnDemandAudienceRepository_I
{
  constructor(
    private prisma: PrismaClient<
      Prisma.PrismaClientOptions,
      never,
      DefaultArgs
    >,
    private modelFlows = ModelFlows
  ) {}

  async fetchExist(props: PropsFetchExist): Promise<number> {
    try {
      return await this.prisma.audience.count({
        where: {
          name: props.name,
          AudienceOnBusiness: {
            some: {
              Business: { accountId: props.accountId },
              id: { in: props.businessIds },
            },
          },
          type: "ondemand",
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `fetchExist`.");
    }
  }

  async create(props: PropsCreate): Promise<{ flowStateId: number }> {
    try {
      const { FlowState } =
        await this.prisma.contactsWAOnAccountOnAudience.create({
          data: {
            audienceId: props.audienceId,
            contactWAOnAccountId: props.contactWAOnAccountId,
            FlowState: {
              create: { campaignId: props.campaignId, type: "campaign" },
            },
          },
          select: {
            FlowState: {
              where: {
                ContactsWAOnAccountOnAudience: {
                  audienceId: props.audienceId,
                  contactWAOnAccountId: props.contactWAOnAccountId,
                },
              },
              select: { id: true },
            },
          },
        });
      return { flowStateId: FlowState[0].id };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `create businessOnCampaignAudience`.");
    }
  }

  async fetchFlow(filter: { accountId: number; _id: number }): Promise<null | {
    nodes: any;
    edges: any;
  }> {
    try {
      const data = await this.modelFlows.aggregate([
        { $match: { ...filter, type: "marketing" } },
        { $project: { edges: "$data.edges", nodes: "$data.nodes" } },
      ]);
      if (data) {
        const { _id, ...nextData } = data[0];
        return nextData;
      }
      return null;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `fetch`.");
    }
  }

  async fetchExistingContactsWA({
    completeNumber,
  }: {
    completeNumber: string;
  }): Promise<{
    contactsWAId: number;
  } | null> {
    try {
      const result = await this.prisma.contactsWA.findFirst({
        where: { completeNumber },
        select: { id: true },
      });
      if (!result) return null;
      return { contactsWAId: result.id };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `fetchExistingContactsWA`.");
    }
  }

  async connectContactsWAExistingToNewContactsOnAccount(
    data: PropsConnectContactsWAExistingToNewContactsOnAccount
  ): Promise<{ contactsWAOnAccountId: number }> {
    try {
      const { id } = await this.prisma.contactsWAOnAccount.create({
        data,
        select: { id: true },
      });
      return { contactsWAOnAccountId: id };
    } catch (error) {
      console.log(error);
      throw new Error(
        "Erro `connectContactsWAExistingToNewContactsOnAccount`."
      );
    }
  }

  async createContactsWAAndContactsOnAccount({
    name,
    accountId,
    ...data
  }: PropsCreateContactsWAAndContactsOnAccount): Promise<{
    contactsWAOnAccountId: number;
  }> {
    try {
      const result = await this.prisma.contactsWA.create({
        data: {
          ...data,
          ContactsWAOnAccount: { create: { accountId, name } },
        },
        select: {
          ContactsWAOnAccount: {
            where: { accountId },
            select: { id: true },
          },
        },
      });
      return {
        contactsWAOnAccountId: result.ContactsWAOnAccount[0].id,
      };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `createContactsWAAndContactsOnAccount`.");
    }
  }

  async fetchExistingTagOnBusiness(where: {
    name: string;
    accountId: number;
    businessIds: number[];
  }): Promise<{
    tagOnBusinessId: number;
  } | null> {
    try {
      const data = await this.prisma.tagOnBusiness.findFirst({
        where: {
          Business: {
            accountId: where.accountId,
            id: { in: where.businessIds },
          },
          Tag: { name: where.name },
        },
        select: { id: true },
      });
      if (!data) return null;
      return { tagOnBusinessId: data.id };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `fetchExistingTagOnBusiness`.");
    }
  }

  async createTagOnBusiness({
    name,
    businessIds,
    accountId,
  }: {
    name: string;
    accountId: number;
    businessIds: number[];
  }): Promise<{ tagOnBusinessIds: number[] }> {
    try {
      const { TagOnBusiness } = await this.prisma.tag.create({
        data: {
          accountId,
          type: "contactwa",
          name,
          TagOnBusiness: {
            createMany: {
              data: businessIds.map((businessId) => ({ businessId })),
            },
          },
        },
        select: {
          TagOnBusiness: {
            select: {
              id: true,
            },
          },
        },
      });
      return { tagOnBusinessIds: TagOnBusiness.map((t) => t.id) };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `createTagOnBusiness`.");
    }
  }

  async createTagOnBusinessOnContactWAOnAccount({
    contactsWAOnAccountId,
    tagOnBusinessId,
  }: {
    contactsWAOnAccountId: number;
    tagOnBusinessId: number;
  }): Promise<void> {
    try {
      await this.prisma.tagOnBusinessOnContactsWAOnAccount.create({
        data: {
          contactsWAOnAccountId,
          tagOnBusinessId,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `createTagOnBusinessOnContactWAOnAccount`.");
    }
  }

  async connectTagOnBusinessToContactsWAOnAccount(
    data: PropsConnectTagOnBusinessToContactsWAOnAccount
  ): Promise<void> {
    try {
      await this.prisma.tagOnBusinessOnContactsWAOnAccount.create({
        data,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `connectTagOnBusinessToContactsWAOnAccount`.");
    }
  }

  async fetchExistingVariablesOnBusiness(where: {
    name: string;
    accountId: number;
  }): Promise<{ variableId: number } | null> {
    try {
      const data = await this.prisma.variable.findFirst({
        where,
        select: { id: true },
      });
      if (!data) return null;
      return { variableId: data.id };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `fetchExistingVariablesOnBusiness`.");
    }
  }

  async createVariableOnBusiness(data: {
    name: string;
    businessIds: number[];
    accountId: number;
  }): Promise<{ variableOnBusinessIds: number[] }> {
    try {
      const { VariableOnBusiness } = await this.prisma.variable.create({
        data: {
          type: "dynamics",
          accountId: data.accountId,
          name: data.name,
          VariableOnBusiness: {
            createMany: {
              data: data.businessIds.map((businessId) => ({ businessId })),
            },
          },
        },
        select: { VariableOnBusiness: { select: { id: true } } },
      });
      return { variableOnBusinessIds: VariableOnBusiness.map((v) => v.id) };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `createVariableOnBusiness`.");
    }
  }

  async createContactsWAOnAccountVariablesOnBusiness(data: {
    value: string;
    variableOnBusinessId: number;
    contactsWAOnAccountId: number;
  }): Promise<void> {
    try {
      await this.prisma.contactsWAOnAccountVariableOnBusiness.create({
        data,
      });
    } catch (error) {
      console.log(error);
      throw new Error(
        "Erro `createVariableOnBusinessAndConnectToContactsWAOnAccountTheVariableOnBusinessCreated`."
      );
    }
  }

  async connectVariableOnBusinessToContactsWAOnAccount(
    data: PropsConnectVariablesOnBusinessToContactsWAOnAccount
  ): Promise<void> {
    try {
      await this.prisma.contactsWAOnAccountVariableOnBusiness.create({ data });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `connectVariableOnBusinessToContactsWAOnAccount`.");
    }
  }

  async findFlowId(props: {
    campaignId: number;
    accountId: number;
  }): Promise<{ flowId: string } | null> {
    try {
      return await this.prisma.campaign.findUnique({
        where: { id: props.campaignId, accountId: props.accountId },
        select: { flowId: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `connectVariableOnBusinessToContactsWAOnAccount`.");
    }
  }
}

import { Prisma, PrismaClient, TypeStatusCampaign } from "@prisma/client";
import { UpdateStatusCampaignRepository_I } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class UpdateStatusCampaignImplementation
  implements UpdateStatusCampaignRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(props: { id: number; accountId: number }): Promise<number> {
    try {
      return await this.prisma.campaign.count({
        where: {
          id: props.id,
          accountId: props.accountId,
          status: { in: ["running", "processing"] },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }

  async update(props: {
    id: number;
    accountId: number;
    status: TypeStatusCampaign;
  }): Promise<void> {
    try {
      await this.prisma.campaign.update({
        where: {
          id: props.id,
          accountId: props.accountId,
        },
        data: { status: props.status },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

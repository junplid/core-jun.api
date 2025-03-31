import { Prisma, PrismaClient } from "@prisma/client";
import { DeleteCampaignRepository_I } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class DeleteCampaignImplementation
  implements DeleteCampaignRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async delete(props: { accountId: number; id: number }): Promise<void> {
    try {
      await this.prisma.campaign.delete({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  async fetchExist(props: { accountId: number; id: number }): Promise<number> {
    try {
      return await this.prisma.campaign.count({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

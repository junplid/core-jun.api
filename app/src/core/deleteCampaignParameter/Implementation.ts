import { Prisma, PrismaClient } from "@prisma/client";
import {
  DeleteCampaignParameterRepository_I,
  PropsDeleteCampaignParameter,
} from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class CraeteCompanyImplementation
  implements DeleteCampaignParameterRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async delete(props: PropsDeleteCampaignParameter): Promise<void> {
    try {
      console.log(props);
      await this.prisma.campaignParameter.delete({
        where: props,
        select: { id: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  async fetchExist(props: PropsDeleteCampaignParameter): Promise<number> {
    try {
      return await this.prisma.campaignParameter.count({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import { DeleteRootCampaignParameterRangesConfigRepository_I } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class DeleteRootCampaignParameterRangesConfigImplementation
  implements DeleteRootCampaignParameterRangesConfigRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}
  async del(props: { id: number }): Promise<void> {
    try {
      await this.prisma.rootCampaignParameterRangesConfig.delete({
        where: { id: props.id },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
  async isAlreadyExists(props: { id: number }): Promise<number> {
    try {
      return await this.prisma.rootCampaignParameterRangesConfig.count({
        where: { id: props.id },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

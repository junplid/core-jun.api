import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  PropsUpdate,
  UpdateRootCampaignParameterRangesConfigRepository_I,
} from "./Repository";

export class UpdateRootCampaignParameterRangesConfigImplementation
  implements UpdateRootCampaignParameterRangesConfigRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async update({ id, ...data }: PropsUpdate): Promise<void> {
    try {
      await this.prisma.rootCampaignParameterRangesConfig.update({
        where: { id },
        data,
        select: { id: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Update Account Asset Data`.");
    }
  }

  async fetchExistParameterWithThisNameAtSequence(props: {
    id: number;
    sequence: number;
  }): Promise<number> {
    try {
      return await this.prisma.rootCampaignParameterRangesConfig.count({
        where: { ...props, status: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

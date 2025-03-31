import { Prisma, PrismaClient } from "@prisma/client";
import {
  CreateRootCampaignParameterRangesConfigRepository_I,
  PropsCreate,
} from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class CreateRootCampaignParameterRangesConfigImplementation
  implements CreateRootCampaignParameterRangesConfigRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async create(
    data: PropsCreate
  ): Promise<{ rootCampaignParameterRangesConfigId: number }> {
    try {
      const { id } = await this.prisma.rootCampaignParameterRangesConfig.create(
        {
          data,
          select: { id: true },
        }
      );
      return {
        rootCampaignParameterRangesConfigId: id,
      };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  async fetchExistParameterWithThisNameAtSequence(props: {
    name: string;
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

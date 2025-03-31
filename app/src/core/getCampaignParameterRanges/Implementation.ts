import { Prisma, PrismaClient } from "@prisma/client";
import { GetCampaignParameterRangesRepository_I, Result } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetCampaignParameterRangesImplementation
  implements GetCampaignParameterRangesRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(): Promise<Result[]> {
    try {
      return await this.prisma.rootCampaignParameterRangesConfig.findMany({
        where: { status: true },
        orderBy: {
          sequence: "asc",
        },
        select: {
          id: true,
          name: true,
          sequence: true,
          timeRest: true,
          timeForShorts: true,
          amountShorts: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

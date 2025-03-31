import { Prisma, PrismaClient } from "@prisma/client";
import {
  GetRootCampaignParameterRangesConfigRepository_I,
  Result,
} from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetRootCampaignParameterRangesConfigImplementation
  implements GetRootCampaignParameterRangesConfigRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(): Promise<Result[]> {
    try {
      return await this.prisma.rootCampaignParameterRangesConfig.findMany({
        orderBy: {
          sequence: "asc",
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

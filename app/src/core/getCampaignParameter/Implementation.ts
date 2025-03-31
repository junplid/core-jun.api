import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetCampaignParameterRepository_I, Result } from "./Repository";

export class GetCampaignParameterImplementation
  implements GetCampaignParameterRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async get(props: { accountId: number }): Promise<Result[]> {
    try {
      const data = await this.prisma.campaignParameter.findMany({
        where: props,
        select: {
          name: true,
          sendDuringHoliday: true,
          // endTime: true,
          // startTime: true,
          createAt: true,
          RootCampaignParameterRangesConfig: {
            select: {
              name: true,
            },
          },
          id: true,
        },
      });
      return data.map(({ RootCampaignParameterRangesConfig, ...d }) => ({
        ...d,
        interval: RootCampaignParameterRangesConfig.name,
      }));
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

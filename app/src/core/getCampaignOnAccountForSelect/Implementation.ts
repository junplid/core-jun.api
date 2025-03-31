import { Prisma, PrismaClient } from "@prisma/client";
import {
  GetCampaignOnAccountForSelectRepository_I,
  ResultFetch,
} from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetCampaignOnAccountForSelectImplementation
  implements GetCampaignOnAccountForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(where: {
    accountId: number;
    businessIds?: number[];
  }): Promise<ResultFetch[]> {
    try {
      return await this.prisma.campaign.findMany({
        where: {
          accountId: where.accountId,
          CampaignOnBusiness: {
            some: {
              Business: {
                ...(where.businessIds?.length && {
                  id: { in: where.businessIds },
                }),
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Campaign`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetBusinessIdOnAccountRepository_I, ResultFetch } from "./Repository";

export class GetBusinessIdOnAccountImplementation
  implements GetBusinessIdOnAccountRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(where: {
    accountId: number;
    id: number;
  }): Promise<ResultFetch | null> {
    try {
      const business = await this.prisma.business.findFirst({
        where,
        select: {
          id: true,
          name: true,
          createAt: true,
          description: true,
          updateAt: true,
          _count: {
            select: {
              ConnectionOnBusiness: true,
              AudienceOnBusiness: true,
              CampaignOnBusiness: true,
            },
          },
        },
      });

      if (business) {
        const { _count, ...rest } = business;
        return {
          ...rest,
          connections: _count.ConnectionOnBusiness,
          audiences: _count.CampaignOnBusiness,
          campaigns: _count.CampaignOnBusiness,
        };
      }
      return null;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Business`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import {
  CampaignAudience_I,
  GetCampaignAudiencesRepository_I,
} from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetCampaignAudiencesImplementation
  implements GetCampaignAudiencesRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async get({
    accountId,
  }: {
    accountId: number;
  }): Promise<CampaignAudience_I[]> {
    try {
      const data = await this.prisma.audience.findMany({
        where: {
          AudienceOnBusiness: {
            some: { Business: { accountId } },
          },
        },
        include: {
          TagOnBusinessOnAudience: {
            select: {
              TagOnBusiness: {
                select: {
                  Tag: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          AudienceOnBusiness: {
            select: {
              Business: { select: { name: true } },
            },
          },
          _count: {
            select: {
              ContactsWAOnAccountOnAudience: {
                where: {
                  ContactsWAOnAccount: {
                    accountId,
                  },
                },
              },
            },
          },
        },
      });
      return data;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }
}

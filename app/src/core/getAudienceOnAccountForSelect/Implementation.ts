import { Prisma, PrismaClient, TypeAudience } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  GetAudienceOnAccountForSelectRepository_I,
  ResultFetch,
} from "./Repository";

export class GetAudienceOnAccountForSelectImplementation
  implements GetAudienceOnAccountForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(where: {
    accountId: number;
    businessIds?: number[];
    type?: TypeAudience;
  }): Promise<ResultFetch[]> {
    try {
      return await this.prisma.audience.findMany({
        where: {
          ...(where.type && { type: where.type }),
          AudienceOnBusiness: {
            some: {
              Business: {
                accountId: where.accountId,
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
      throw new Error("Erro `Create Audience`.");
    }
  }
}

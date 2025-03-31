import { Prisma, PrismaClient } from "@prisma/client";
import { GetSectorsForSelectRepository_I, ResultFetch } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetSectorsForSelectImplementation
  implements GetSectorsForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch({
    accountId,
    businessIds,
  }: {
    accountId: number;
    businessIds?: number[];
  }): Promise<ResultFetch[]> {
    try {
      return await this.prisma.sectors.findMany({
        where: {
          accountId,
          ...(businessIds?.length && { businessId: { in: businessIds } }),
        },
        select: {
          id: true,
          name: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Parameters`.");
    }
  }
}

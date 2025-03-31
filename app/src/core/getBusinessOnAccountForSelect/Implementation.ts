import { Prisma, PrismaClient } from "@prisma/client";
import {
  GetBusinessOnAccountForSelectRepository_I,
  ResultFetch,
} from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetBusinessOnAccountForSelectImplementation
  implements GetBusinessOnAccountForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(where: {
    accountId: number;
    filterIds?: number[];
  }): Promise<ResultFetch[]> {
    try {
      return await this.prisma.business.findMany({
        where: {
          accountId: where.accountId,
          ...(where.filterIds?.length && {
            id: { in: where.filterIds },
          }),
        },
        select: {
          id: true,
          name: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Business`.");
    }
  }
}

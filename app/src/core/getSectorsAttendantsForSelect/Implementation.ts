import { Prisma, PrismaClient } from "@prisma/client";
import {
  GetSectorsAttendantsForSelectRepository_I,
  ResultFetch,
} from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetSectorsAttendantsForSelectImplementation
  implements GetSectorsAttendantsForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch({
    accountId,
    businessIds,
    sector,
  }: {
    accountId: number;
    businessIds?: number[];
    sector?: number;
  }): Promise<ResultFetch[]> {
    try {
      return await this.prisma.sectorsAttendants.findMany({
        where: {
          accountId,
          ...(businessIds?.length && {
            businessId: { in: businessIds },
          }),
          // independente sempre irá trazer atendetes do setor + atendente livres ou somente atendentes livres
          ...(sector !== undefined &&
            sector === 0 && {
              sectorsId: null,
            }),
          ...(sector !== undefined &&
            sector > 0 && {
              OR: [{ sectorsId: sector }, { sectorsId: null }],
            }),
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

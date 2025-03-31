import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GeKanbanForSelectRepository_I, ResultFetch } from "./Repository";

export class GeKanbanForSelectImplementation
  implements GeKanbanForSelectRepository_I
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
      return await this.prisma.funnelKanban.findMany({
        where: {
          accountId,
          businessId: { in: businessIds },
        },
        select: { id: true, name: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Parameters`.");
    }
  }
}

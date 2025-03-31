import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  GeKanbanColumnForSelectFlowRepository_I,
  ResultFetch,
} from "./Repository";

export class GeKanbanColumnForSelectFlowImplementation
  implements GeKanbanColumnForSelectFlowRepository_I
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
      const data = await this.prisma.stepsFunnelKanban.findMany({
        where: {
          accountId,
          ...(businessIds?.length && {
            FunnelKanban: { businessId: { in: businessIds } },
          }),
        },
        select: { id: true, name: true, sequence: true },
      });

      return data.map((s) => ({ id: s.id, name: `(${s.sequence}) ${s.name}` }));
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Parameters`.");
    }
  }
}

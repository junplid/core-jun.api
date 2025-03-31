import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetKanbanForSelectRepository_I } from "./Repository";

export class GetKanbanForSelectImplementation
  implements GetKanbanForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(where: {
    ticketId: number;
    userId: number;
  }): Promise<{ name: string; id: number }[] | null> {
    try {
      const data = await this.prisma.sectorsAttendants.findFirst({
        where: { id: where.userId },
        select: {
          Sectors: {
            select: {
              FunnelKanban: {
                select: {
                  StepsFunnelKanban: {
                    orderBy: { sequence: "asc" },
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return data?.Sectors?.FunnelKanban
        ? data.Sectors.FunnelKanban.StepsFunnelKanban.map((s) => s)
        : null;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Parameters`.");
    }
  }
}

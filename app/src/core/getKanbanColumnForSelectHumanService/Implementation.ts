import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  GeKanbanColumnForSelectHumanServiceRepository_I,
  IProps,
  ResultFetch,
} from "./Repository";

export class GeKanbanColumnForSelectHumanServiceImplementation
  implements GeKanbanColumnForSelectHumanServiceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(props: IProps): Promise<ResultFetch[]> {
    try {
      const data = await this.prisma.stepsFunnelKanban.findMany({
        where: {
          FunnelKanban: {
            Sectors: {
              some: {
                ...(props.sectorId
                  ? { id: props.sectorId }
                  : {
                      OR: [
                        { SectorsAttendants: { some: { id: props.userId } } },
                        { supervisorsId: props.userId },
                      ],
                    }),
              },
            },
          },
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

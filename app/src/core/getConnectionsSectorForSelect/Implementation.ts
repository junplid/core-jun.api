import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  GetConnectionsSectorForSelectRepository_I,
  ResultFetch,
} from "./Repository";

export class GetConnectionsSectorForSelectImplementation
  implements GetConnectionsSectorForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(where: { userId: number }): Promise<ResultFetch[]> {
    try {
      const data = await this.prisma.sectors.findFirst({
        where: {
          OR: [
            { SectorsAttendants: { some: { id: where.userId } } },
            { Supervisors: { id: where.userId } },
          ],
        },
        select: {
          SectorsOnConnections: {
            select: {
              ConnectionOnBusiness: {
                select: {
                  id: true,
                  name: true,
                  Business: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      if (!data) return [];

      return data.SectorsOnConnections.map(({ ConnectionOnBusiness: c }) => ({
        id: c.id,
        name: `${c.name} - ${c.Business.name}`,
      }));
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Parameters`.");
    }
  }
}

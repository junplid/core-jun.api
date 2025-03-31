import { Prisma, PrismaClient } from "@prisma/client";
import { Props, Result } from "./Repository";
import { GetSectorsRepository_I } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetSectorsImplementation implements GetSectorsRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch({ ...props }: Props): Promise<Result[]> {
    try {
      const data = await this.prisma.sectors.findMany({
        where: props,
        select: {
          name: true,
          createAt: true,
          id: true,
          status: true,
          Supervisors: { select: { name: true } },
          Business: { select: { name: true } },
          _count: { select: { SectorsAttendants: true } },
        },
      });
      return data.map(({ Business, Supervisors, _count, ...item }) => {
        return {
          ...item,
          supervisorName: Supervisors?.name ?? "",
          countSectorsAttendants: _count.SectorsAttendants,
          business: Business.name,
        };
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}

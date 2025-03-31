import { Prisma, PrismaClient } from "@prisma/client";
import { GetCheckPointsRepository_I, Result } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetCheckPointsImplementation
  implements GetCheckPointsRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch({ accountId }: { accountId: number }): Promise<Result[]> {
    try {
      const data = await this.prisma.checkPoint.findMany({
        where: {
          accountId,
        },
        select: {
          name: true,
          id: true,
          createAt: true,
          score: true,
          CheckPointOnBusiness: {
            select: {
              Business: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return data.map(({ CheckPointOnBusiness, ...d }) => ({
        ...d,
        business: CheckPointOnBusiness.map((c) => c.Business.name).join(", "),
      }));
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get checkpoint fetchAlreadyExists`.");
    }
  }
}

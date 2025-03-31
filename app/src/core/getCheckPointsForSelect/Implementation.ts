import { Prisma, PrismaClient } from "@prisma/client";
import { GetCheckPointsForSelectRepository_I, Props } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetCheckPointsForSelectImplementation
  implements GetCheckPointsForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch({ businessIds, ...props }: Props): Promise<
    {
      name: string;
      id: number;
    }[]
  > {
    try {
      return await this.prisma.checkPoint.findMany({
        where: {
          ...props,
          ...(businessIds?.length && {
            CheckPointOnBusiness: {
              some: {
                businessId: { in: businessIds },
              },
            },
          }),
        },
        select: {
          name: true,
          id: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get checkpoint fetchAlreadyExists`.");
    }
  }
}

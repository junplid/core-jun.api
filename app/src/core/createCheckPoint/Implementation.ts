import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { CreateCheckPointRepository_I, Props } from "./Repository";

export class CreateCheckPointImplementation
  implements CreateCheckPointRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetchAlreadyExists({ businessIds, ...props }: Props): Promise<number> {
    try {
      return await this.prisma.checkPoint.count({
        where: {
          ...props,
          CheckPointOnBusiness: {
            some: {
              businessId: { in: businessIds },
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }

  async create({
    businessIds,
    ...props
  }: Props): Promise<{ createAt: Date; id: number; business: string }> {
    try {
      const data = await this.prisma.checkPoint.create({
        data: {
          name: props.name,
          score: 0,
          accountId: props.accountId,
          CheckPointOnBusiness: {
            createMany: {
              data: businessIds.map((businessId) => ({ businessId })),
            },
          },
        },
        select: {
          createAt: true,
          id: true,
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
      return {
        createAt: data.createAt,
        id: data.id,
        business: data.CheckPointOnBusiness.map((c) => c.Business.name).join(
          ", "
        ),
      };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}

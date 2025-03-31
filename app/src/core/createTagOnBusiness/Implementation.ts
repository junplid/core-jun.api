import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { CreateTagOnBusinessRepository_I, Props } from "./Repository";

export class CreateTagOnBusinessImplementation
  implements CreateTagOnBusinessRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async create(data: Props): Promise<{ tagId: number }> {
    try {
      const { id } = await this.prisma.tag.create({
        data: {
          accountId: data.accountId,
          name: data.name,
          type: data.type,
          TagOnBusiness: {
            createMany: {
              data: data.businessIds.map((b) => ({
                businessId: b,
              })),
            },
          },
        },
        select: { id: true },
      });
      return { tagId: id };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  async fetchExist(props: Props): Promise<number> {
    try {
      return await this.prisma.tag.count({
        where: {
          name: props.name,
          type: props.type,
          accountId: props.accountId,
          TagOnBusiness: {
            some: { businessId: { in: props.businessIds } },
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

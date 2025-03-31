import { Prisma, PrismaClient, TypeTag } from "@prisma/client";
import { GetTagForSelectRepository_I, ResultGet } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetTagForSelectImplementation
  implements GetTagForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async get(props: {
    accountId: number;
    type?: TypeTag;
    businessIds: number[];
  }): Promise<ResultGet[]> {
    try {
      const data = await this.prisma.tagOnBusiness.findMany({
        where: {
          businessId: { in: props.businessIds },
          Business: { accountId: props.accountId },
          Tag: {
            ...(props.type && { type: props.type }),
          },
        },
        orderBy: { id: "desc" },
        select: {
          Tag: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });
      return data.map((t) => ({
        ...t.Tag,
      }));
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get Tag Asset Data`.");
    }
  }
}

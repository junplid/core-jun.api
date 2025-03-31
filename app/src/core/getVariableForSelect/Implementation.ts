import { Prisma, PrismaClient, TypeVariable } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetVariableForSelectRepository_I, ResultGet } from "./Repository";

export class GetVariableForSelectImplementation
  implements GetVariableForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async get(props: {
    accountId: number;
    businessIds: number[];
    type?: TypeVariable[];
    name?: string;
  }): Promise<ResultGet[]> {
    try {
      const data = await this.prisma.variable.findMany({
        where: {
          ...(props.type?.length && { type: { in: props.type } }),
          VariableOnBusiness: {
            some: {
              businessId: { in: props.businessIds },
              Business: { accountId: props.accountId },
            },
          },
          ...(props.name && { name: { contains: props.name } }),
        },
        orderBy: { id: "desc" },
        select: {
          name: true,
          id: true,
        },
      });
      return data.map((v) => v);
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get Tag Asset Data`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetFieldsConnectionWARepository_I, IConn } from "./Repository";

export class GetFieldsConnectionWAImplementation
  implements GetFieldsConnectionWARepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(connWAId: number): Promise<IConn | null> {
    try {
      // const data = await this.prisma.connectionOnBusiness.findUnique({
      //   where: { id: connWAId },
      //   select: {
      //     name: true,
      //     type: true,
      //     businessId: true,
      //   },
      // });

      return null;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Connection`.");
    }
  }
}

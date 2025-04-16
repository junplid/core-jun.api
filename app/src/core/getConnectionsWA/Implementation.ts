import { Prisma, PrismaClient, TypeConnetion } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetConnectionsWARepository_I } from "./Repository";

export class GetConnectionsWAImplementation
  implements GetConnectionsWARepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch({ accountId }: { accountId: number }): Promise<
    {
      name: string;
      business: string;
      type: TypeConnetion;
      id: number;
      createAt: Date;
    }[]
  > {
    try {
      // const data = await this.prisma.connectionOnBusiness.findMany({
      //   where: {
      //     Business: { accountId },
      //   },
      //   select: {
      //     name: true,
      //     type: true,
      //     id: true,
      //     Business: {
      //       select: { name: true },
      //     },
      //     createAt: true,
      //   },
      // });

      // return data.map(({ Business, ...c }) => ({
      //   ...c,
      //   business: Business.name,
      // }));
      return [];
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Connection`.");
    }
  }
}

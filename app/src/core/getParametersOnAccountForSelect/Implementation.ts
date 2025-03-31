import { Prisma, PrismaClient } from "@prisma/client";
import {
  GetParametersOnAccountForSelectRepository_I,
  ResultFetch,
} from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetParametersOnAccountForSelectImplementation
  implements GetParametersOnAccountForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(where: { accountId: number }): Promise<ResultFetch[]> {
    try {
      return await this.prisma.campaignParameter.findMany({
        where,
        select: {
          id: true,
          name: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Parameters`.");
    }
  }
}

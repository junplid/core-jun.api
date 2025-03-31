import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetIntegrationsRepository_I, ResultFetch } from "./Repository";

export class GetIntegrationsOnAccountImplementation
  implements GetIntegrationsRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetchContactWAOnAccount(props: {
    accountId: number;
  }): Promise<ResultFetch[]> {
    try {
      return await this.prisma.integrations.findMany({
        where: props,
        select: {
          name: true,
          id: true,
          createAt: true,
          key: true,
          token: true,
          type: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Method not implemented.");
    }
  }
}

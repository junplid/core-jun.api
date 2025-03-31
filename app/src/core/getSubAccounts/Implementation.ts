import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetSubAccountsRepository_I, Result } from "./Repository";

export class GetSubAccountsImplementation
  implements GetSubAccountsRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch({ accountId }: { accountId: number }): Promise<Result[]> {
    try {
      const data = await this.prisma.subAccount.findMany({
        where: { accountId },
        select: {
          name: true,
          id: true,
          createAt: true,
          status: true,
          email: true,
        },
      });

      return data;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get checkpoint fetchAlreadyExists`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetSomeAccountRepository_I } from "./Repository";

export class GetSomeAccountImplementation
  implements GetSomeAccountRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async findAccount(accountId: number): Promise<boolean> {
    try {
      return !!(await this.prisma.account.findFirst({
        where: { id: accountId },
        select: { id: true },
      }));
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Some Account`.");
    }
  }
}

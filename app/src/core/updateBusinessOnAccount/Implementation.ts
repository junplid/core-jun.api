import { Prisma, PrismaClient } from "@prisma/client";
import { UpdateBusinessOnAccountRepository_I } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class UpdateBusinessOnAccountImplementation
  implements UpdateBusinessOnAccountRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async update(
    where: { id: number; accountId: number },
    data: { name?: string; description?: string }
  ): Promise<void> {
    try {
      await this.prisma.business.update({ where, data });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Update Business`.");
    }
  }

  async fetchExist(props: { id: number; accountId: number }): Promise<number> {
    try {
      return await this.prisma.business.count({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch business`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import { DeleteBatchBusinessOnAccountRepository_I } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class DeleteBatchBusinessOnAccountImplementation
  implements DeleteBatchBusinessOnAccountRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async delete(where: { id: number; accountId: number }): Promise<void> {
    try {
      await this.prisma.business.delete({ where });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Deletar Business`.");
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

import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { DeleteCheckpointRepository_I } from "./Repository";

export class DeleteCheckpointImplementation
  implements DeleteCheckpointRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async delete(props: { accountId: number; id: number }): Promise<void> {
    try {
      await this.prisma.checkPoint.delete({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  async fetchExist(props: { accountId: number; id: number }): Promise<number> {
    try {
      return await this.prisma.checkPoint.count({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

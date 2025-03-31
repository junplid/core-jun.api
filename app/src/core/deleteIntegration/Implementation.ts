import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { DeleteIntegrationRepository_I } from "./Repository";

export class DeleteIntegrationImplementation
  implements DeleteIntegrationRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async delete(props: { accountId: number; id: number }): Promise<void> {
    try {
      await this.prisma.integrations.delete({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  async fetchExist(props: { accountId: number; id: number }): Promise<number> {
    try {
      return await this.prisma.integrations.count({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

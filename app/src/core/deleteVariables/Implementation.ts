import { Prisma, PrismaClient } from "@prisma/client";
import { DeleteVariableRepository_I } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class DeleteVariableImplementation
  implements DeleteVariableRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async delete(props: { variableId: number }): Promise<void> {
    try {
      await this.prisma.variable.delete({ where: { id: props.variableId } });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Delete Account Asset Data`.");
    }
  }

  async fetchExist(props: {
    variableId: number;
    accountId: number;
  }): Promise<number> {
    try {
      return await this.prisma.variable.count({
        where: {
          id: props.variableId,
          accountId: props.accountId,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

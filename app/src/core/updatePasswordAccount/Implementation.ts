import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { PropsUpdate, UpdatePasswordAccountRepository_I } from "./Repository";

export class UpdatePasswordAccountImplementation
  implements UpdatePasswordAccountRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async update({ accountId, password }: PropsUpdate): Promise<void> {
    try {
      await this.prisma.account.update({
        where: { id: accountId },
        data: { password },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }

  async alreadyExisting(id: number): Promise<boolean> {
    try {
      return !!(await this.prisma.account.findFirst({
        where: { id },
      }));
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}

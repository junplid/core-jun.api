import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { UpdateRootUserRepository_I } from "./Repository";

export class CraeteFlowImplementation implements UpdateRootUserRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async update(
    filter: { rootId: number },
    data: {
      email: string;
      password: string;
    }
  ): Promise<void> {
    try {
      await this.prisma.rootUsers.update({
        where: { id: filter.rootId },
        data,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `fetchAndUpdate`.");
    }
  }
}

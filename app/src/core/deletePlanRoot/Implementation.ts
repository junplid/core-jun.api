import { Prisma, PrismaClient } from "@prisma/client";
import { DeletePlanRepository_I } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class DeletePlanImplementation implements DeletePlanRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async delete({ id }: { id: number }): Promise<void> {
    try {
      await this.prisma.plan.delete({
        where: { id },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Delete Plan`.");
    }
  }
}

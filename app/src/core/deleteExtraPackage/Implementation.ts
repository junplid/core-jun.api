import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { DeleteExtraPackageRepository_I } from "./Repository";

export class DeleteExtraPackageImplementation
  implements DeleteExtraPackageRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async delete({ id }: { id: number }): Promise<void> {
    try {
      await this.prisma.extraPackages.delete({ where: { id } });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Delete Plan`.");
    }
  }
}

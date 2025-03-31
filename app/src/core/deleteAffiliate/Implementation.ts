import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { DeleteAffiliatesRepository_I } from "./Repository";

export class DeleteAffiliatesImplementation
  implements DeleteAffiliatesRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async del(id: number): Promise<void> {
    try {
      await this.prisma.affiliates.delete({
        where: { id },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Delete Account`.");
    }
  }
}

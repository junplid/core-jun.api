import { Prisma, PrismaClient } from "@prisma/client";
import { DeleteContactWARepository_I } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class DeleteContactWAImplementation
  implements DeleteContactWARepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async delete(props: { id: number }): Promise<void> {
    try {
      await this.prisma.contactsWA.delete({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Delete Account Asset Data`.");
    }
  }
}

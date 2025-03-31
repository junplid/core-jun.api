import { Prisma, PrismaClient } from "@prisma/client";
import { DeleteSectorRepository_I, Props } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class DeleteSectorImplementation implements DeleteSectorRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async delete({ ...props }: Props): Promise<void> {
    try {
      await this.prisma.sectors.delete({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import { DeleteSectorAttendantRepository_I, Props } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class DeleteSectorAttendantImplementation
  implements DeleteSectorAttendantRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async delete({ ...props }: Props): Promise<void> {
    try {
      await this.prisma.sectorsAttendants.delete({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import { DeleteBatchSupervisorRepository_I, Props } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class DeleteBatchSupervisorImplementation
  implements DeleteBatchSupervisorRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async delete({ ...props }: Props): Promise<void> {
    try {
      await this.prisma.supervisors.delete({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
  async fetchExist(props: { id: number; accountId: number }): Promise<number> {
    try {
      return await this.prisma.supervisors.count({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch business`.");
    }
  }
}

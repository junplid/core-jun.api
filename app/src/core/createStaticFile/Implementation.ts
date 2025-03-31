import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { CreateStaticFileRepository_I, PropsCreate } from "./Repository";

export class CreateStaticFileImplementation
  implements CreateStaticFileRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async create(data: PropsCreate): Promise<{
    readonly id: number;
  }> {
    try {
      return await this.prisma.staticPaths.create({
        data,
        select: { id: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Business`.");
    }
  }
}

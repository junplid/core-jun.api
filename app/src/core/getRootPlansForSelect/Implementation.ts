import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetRootPlansForSelectRepository_I, ResultFetch } from "./Repository";

export class GetRootPlansForSelectImplementation
  implements GetRootPlansForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(): Promise<ResultFetch[]> {
    try {
      return await this.prisma.plan.findMany({
        where: {
          acceptsNewUsers: true,
          allowsRenewal: true,
          isDefault: false,
          type: "paid",
        },
        select: { id: true, name: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Parameters`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  GetRootExtraPackagesForSelectRepository_I,
  ResultFetch,
} from "./Repository";

export class GetRootExtraPackagesForSelectImplementation
  implements GetRootExtraPackagesForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(): Promise<ResultFetch[]> {
    try {
      return await this.prisma.extraPackages.findMany({
        where: { status: true },
        select: { id: true, name: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Parameters`.");
    }
  }
}

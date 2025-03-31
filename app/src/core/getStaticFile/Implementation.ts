import { Prisma, PrismaClient, TypeStaticPath } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetStaticFileRepository_I, PropsGet } from "./Repository";

export class GetStaticFileImplementation implements GetStaticFileRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(data: PropsGet): Promise<
    {
      readonly id: number;
      readonly originalName: string;
      readonly name: string;
      readonly type: TypeStaticPath;
      readonly size: number;
    }[]
  > {
    try {
      return await this.prisma.staticPaths.findMany({
        where: data,
        select: {
          id: true,
          originalName: true,
          name: true,
          type: true,
          size: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get Business`.");
    }
  }
}

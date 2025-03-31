import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetRootCouponsForSelectRepository_I, ResultFetch } from "./Repository";

export class GetRootCouponsForSelectImplementation
  implements GetRootCouponsForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(): Promise<ResultFetch[]> {
    try {
      const daa = await this.prisma.coupons.findMany({
        where: { status: true },
        select: { id: true, name: true, activationCode: true },
      });
      return daa.map((s) => ({
        id: s.id,
        name: `${s.name}(${s.activationCode})`,
      }));
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Parameters`.");
    }
  }
}

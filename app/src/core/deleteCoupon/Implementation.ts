import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { DeleteCouponRepository_I } from "./Repository";

export class DeleteCouponImplementation implements DeleteCouponRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async del(id: number): Promise<void> {
    try {
      await this.prisma.coupons.delete({ where: { id } });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Delete Account`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetCouponsRepository_I, IResult } from "./Repository";

export class GetCouponsImplementation implements GetCouponsRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(): Promise<IResult[]> {
    try {
      return await this.prisma.coupons.findMany({
        select: {
          id: true,
          name: true,
          status: true,
          description: true,
          activationCode: true,
          applicableTo: true,
          createAt: true,
          discountType: true,
          discountValue: true,
          maxQuantity: true,
          quantityUsed: true,
          isValidOnRenewal: true,
          validFrom: true,
          validUntil: true,
          ApplicableCoupons: {
            select: {
              planId: true,
              extraPackageId: true,
              type: true,
            },
          },
          _count: {
            select: {
              Affiliates: { where: { status: true } },
              ApplicableCoupons: true,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Delete Account`.");
    }
  }
}

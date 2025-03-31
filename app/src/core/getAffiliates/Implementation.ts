import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetAffiliatesRepository_I, IResult } from "./Repository";

export class GetAffiliatesImplementation implements GetAffiliatesRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(): Promise<IResult[]> {
    try {
      return await this.prisma.affiliates.findMany({
        select: {
          reference: true,
          id: true,
          walletId: true,
          name: true,
          email: true,
          status: true,
          createAt: true,
          ContactWA: { select: { completeNumber: true } },
          Coupon: { select: { id: true, name: true, activationCode: true } },
          commissionType: true,
          commissionValue: true,
          description: true,
          effectiveAfterDays: true,
          pixKey: true,
          pixKeyType: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Delete Account`.");
    }
  }
}

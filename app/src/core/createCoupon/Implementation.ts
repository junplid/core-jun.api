import { ApplicableTo, Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { CreateCouponRepository_I, ICreateProps, IResult } from "./Repository";

export class CreateCouponImplementation implements CreateCouponRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async create({
    plansIds,
    extrasIds,
    status,
    applicableTo,
    ...coupon
  }: ICreateProps): Promise<IResult> {
    try {
      const listPlan = plansIds?.map((id) => ({ id, type: "PLANS" })) ?? [];
      const listExtra = extrasIds?.map((id) => ({ id, type: "EXTRAS" })) ?? [];
      const listApplicableTo: { id: number; type: ApplicableTo }[] = [].concat(
        // @ts-expect-error
        listExtra,
        listPlan
      );

      return await this.prisma.coupons.create({
        data: {
          ...coupon,
          status: !!status,
          applicableTo: applicableTo ? JSON.stringify(applicableTo) : undefined,
          ...(listApplicableTo?.length && {
            ApplicableCoupons: {
              createMany: {
                data: listApplicableTo.map(({ type, id }) => ({
                  type,
                  ...(type === "EXTRAS" && { extraPackageId: id }),
                  ...(type === "PLANS" && { planId: id }),
                })),
              },
            },
          }),
        },
        select: {
          id: true,
          createAt: true,
          ApplicableCoupons: {
            select: {
              Plans: { select: { name: true } },
              ExtraPackages: { select: { name: true } },
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

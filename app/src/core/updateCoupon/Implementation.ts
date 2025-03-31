import { ApplicableTo, Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { UpdateCouponRepository_I, IUpdateProps } from "./Repository";

export class UpdateCouponImplementation implements UpdateCouponRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async update({
    status,
    plansIds,
    extrasIds,
    id,
    ...props
  }: IUpdateProps): Promise<void> {
    try {
      if (plansIds?.length) {
        for await (const planId of plansIds) {
          const appl = await this.prisma.applicableCoupons.findFirst({
            where: { planId, couponId: id },
            select: { id: true },
          });
          if (appl?.id) {
            await this.prisma.applicableCoupons.delete({
              where: { id: appl.id },
            });
          }
        }
      }
      if (extrasIds?.length) {
        for await (const extraId of extrasIds) {
          const appl = await this.prisma.applicableCoupons.findFirst({
            where: { extraPackageId: extraId, couponId: id },
            select: { id: true },
          });
          if (appl?.id) {
            await this.prisma.applicableCoupons.delete({
              where: { id: appl.id },
            });
          }
        }
      }
      const listPlan = plansIds?.map((id) => ({ id, type: "PLANS" })) ?? [];
      const listExtra = extrasIds?.map((id) => ({ id, type: "EXTRAS" })) ?? [];
      const listApplicableTo: { id: number; type: ApplicableTo }[] = [].concat(
        // @ts-expect-error
        listExtra,
        listPlan
      );

      await this.prisma.coupons.update({
        where: { id },
        data: {
          ...props,
          ...(status !== undefined && { status: !!status }),
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
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Delete Account`.");
    }
  }
}

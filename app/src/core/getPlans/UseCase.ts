import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../../adapters/Prisma/client";
import { GetPlansDTO_I } from "./DTO";

export class GetPlansUseCase {
  constructor() {}

  async run(dto: GetPlansDTO_I) {
    // pegar o afiliado desse ADM
    const affiliate = await prisma.account.findFirst({
      where: { id: dto.accountId },
      select: {
        isUsedFreeTrialTime: true,
        HandleAccountAffiliates: {
          take: 1,
          where: { Affiliate: { status: true } },
          orderBy: { createAt: "desc" },
          select: { affiliateId: true },
        },
      },
    });

    const affiliateId = affiliate?.HandleAccountAffiliates[0]?.affiliateId || 0;

    const plans = await prisma.plan.findMany({
      where: {
        acceptsNewUsers: true,
        allowsRenewal: true,
        type: "paid",
        NOT: { Account: { some: { id: dto.accountId } } },
      },
      select: {
        id: true,
        name: true,
        label: true,
        description: true,
        type: true,
        free_trial_time: true,
        ApplicableCoupons: {
          orderBy: { id: "asc" },
          where: {
            type: "PLANS",
            Coupon: {
              status: true,
              Affiliates: {
                some: {
                  id: affiliateId,
                  HandleAccountAffiliates: {
                    some: { accountId: dto.accountId },
                  },
                },
              },
            },
          },
          select: {
            Coupon: {
              select: {
                discountType: true,
                discountValue: true,
                validFrom: true,
                validUntil: true,
                maxQuantity: true,
                quantityUsed: true,
              },
            },
          },
        },
        PlanAssets: {
          select: {
            connections: true,
            chatbots: true,
            attendants: true,
            marketingSends: true,
            business: true,
            flow: true,
          },
        },
        PlanPeriods: {
          orderBy: { price: "asc" },
          select: {
            price: true,
            cycle: true,
          },
        },
      },
    });

    const nextPlans = plans.map(({ ApplicableCoupons, ...plan }) => {
      // const assestNodes = Object.entries(plan.PlanAssets!).map((assets) => {
      //   const assetsKey = assets[0] as keyof Omit<PlanAssets, "id" | "planId">;
      //   if (/^(node)\S+/i.test(assetsKey) && assets[1]) {
      //     return { label: objectLabelAssets[assetsKey], value: true };
      //   }
      // });
      // const assestQnt = Object.entries(plan.PlanAssets!).map((assets) => {
      //   const assetsKey = assets[0] as keyof Omit<PlanAssets, "id" | "planId">;
      //   if (!/^(node)\S+/i.test(assetsKey)) {
      //     const assetsValue = assets[1];
      //     return { label: objectLabelAssets[assetsKey], value: assetsValue };
      //   }
      // });

      const coupomValid = ApplicableCoupons.find((ap) => {
        if (ap.Coupon.validFrom && ap.Coupon.validUntil) {
          const now = new Date();
          if (now < ap.Coupon.validFrom || now > ap.Coupon.validUntil) {
            return false;
          }
        }
        if (ap.Coupon.validFrom && !ap.Coupon.validUntil) {
          const now = new Date();
          if (now < ap.Coupon.validFrom) {
            return false;
          }
        }
        if (ap.Coupon.validUntil && !ap.Coupon.validFrom) {
          const now = new Date();
          if (now > ap.Coupon.validUntil) {
            return false;
          }
        }
        if (
          ap.Coupon.maxQuantity &&
          ap.Coupon.quantityUsed >= ap.Coupon.maxQuantity
        ) {
          return false;
        }
        return true;
      });

      const planPeriod = plan.PlanPeriods.find((pe) => {
        if (pe.cycle === "MONTHLY") return true;
        if (pe.cycle === "YEARLY") return true;
        return true;
      });

      let discount: Decimal = new Decimal(0);

      if (planPeriod) {
        if (coupomValid?.Coupon.discountType === "PERCENTAGE") {
          discount = planPeriod.price.minus(
            planPeriod.price.times(coupomValid.Coupon.discountValue / 100)
          );
        } else if (coupomValid?.Coupon.discountType === "REAL") {
          discount = planPeriod.price.minus(coupomValid.Coupon.discountValue);
        }

        if (planPeriod.price.lessThan(0)) discount = new Decimal(0);
      }

      return {
        ...plan,
        PlanPeriods: planPeriod!,
        ...(!!coupomValid && !!affiliate && { discount }),
        free_trial_time: affiliate?.isUsedFreeTrialTime
          ? undefined
          : plan.free_trial_time,
        // PlanAssets: {
        //   qnt: assestQnt.filter((s) => s),
        //   nodes: assestNodes.filter((s) => s),
        // },
      };
    });

    return {
      message: "OK",
      status: 200,
      plans: nextPlans,
    };
  }
}

import { GetDiscountCoupomDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ApplicableTo } from "@prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetDiscountCoupomUseCase {
  constructor() {}

  async run(dto: GetDiscountCoupomDTO_I) {
    const applicableToType = dto.planId ? "PLANS" : "EXTRAS";

    const coupon = await prisma.coupons
      .findFirst({
        where: {
          activationCode: dto.code,
          status: true,
          ApplicableCoupons: {
            some: {
              ...(dto.planId
                ? { planId: dto.planId }
                : { extraPackageId: dto.extraId }),
            },
          },
        },
        select: {
          applicableTo: true,
          discountType: true,
          discountValue: true,
          maxQuantity: true,
          quantityUsed: true,
          isValidOnRenewal: true,
          validFrom: true,
          validUntil: true,
        },
      })
      .catch((err) => console.log(err));

    if (!coupon) {
      throw new ErrorResponse(400).input({
        path: "code",
        text: `Cupom indisponível ou atingiu o limite de uso!`,
      });
    }

    if (!coupon.applicableTo) {
      throw new ErrorResponse(400).input({
        path: "code",
        text: `Cupom indisponível ou atingiu o limite de uso!`,
      });
    }

    const applicableTo: ApplicableTo = JSON.parse(coupon.applicableTo);
    if (!applicableTo.includes(applicableToType)) {
      throw new ErrorResponse(400).input({
        path: "code",
        text: `Cupom indisponível ou atingiu o limite de uso!`,
      });
    }

    if (coupon.validFrom && coupon.validUntil) {
      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validUntil) {
        throw new ErrorResponse(400).input({
          path: "code",
          text: `Cupom indisponível ou atingiu o limite de uso!`,
        });
      }
    }

    if (coupon.validFrom && !coupon.validUntil) {
      const now = new Date();
      if (now < coupon.validFrom) {
        throw new ErrorResponse(400).input({
          path: "code",
          text: `Cupom indisponível ou atingiu o limite de uso!`,
        });
      }
    }

    if (coupon.validUntil && !coupon.validFrom) {
      const now = new Date();
      if (now > coupon.validUntil) {
        throw new ErrorResponse(400).input({
          path: "code",
          text: `Cupom indisponível ou atingiu o limite de uso!`,
        });
      }
    }

    if (coupon.maxQuantity && coupon.quantityUsed >= coupon.maxQuantity) {
      throw new ErrorResponse(400).input({
        path: "code",
        text: `Cupom atingiu o limite de uso!`,
      });
    }

    return {
      message: "OK!",
      status: 200,
      coupon: {
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        isValidOnRenewal: coupon.isValidOnRenewal,
      },
    };
  }
}

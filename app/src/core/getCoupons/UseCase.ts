import { GetCouponsDTO_I } from "./DTO";
import { GetCouponsRepository_I } from "./Repository";

export class GetCouponsUseCase {
  constructor(private repository: GetCouponsRepository_I) {}

  async run(dto: GetCouponsDTO_I) {
    const listCoupons = await this.repository.fetch();
    const coupons = listCoupons.map(({ ApplicableCoupons, ...coupon }) => ({
      ...coupon,
      ...(coupon.applicableTo && {
        applicableTo: JSON.parse(coupon.applicableTo),
      }),
      plansIds: ApplicableCoupons.filter((p) => p.type === "PLANS").map(
        (p) => p.planId
      ),
      extrasIds: ApplicableCoupons.filter((p) => p.type === "EXTRAS").map(
        (p) => p.extraPackageId
      ),
    }));

    return {
      message: "OK!",
      status: 201,
      coupons,
    };
  }
}

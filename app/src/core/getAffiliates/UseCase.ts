import { GetAffiliatesDTO_I } from "./DTO";
import { GetAffiliatesRepository_I } from "./Repository";

export class GetAffiliatesUseCase {
  constructor(private repository: GetAffiliatesRepository_I) {}

  async run(dto: GetAffiliatesDTO_I) {
    const affiliates = await this.repository.fetch();
    affiliates.map((affiliate) => ({
      ...affiliate,
      ...(affiliate.Coupon && {
        Coupon: {
          ...affiliate.Coupon,
          id: affiliate.Coupon.id,
          name: affiliate.Coupon.name + `(${affiliate.Coupon.activationCode})`,
        },
      }),
    }));

    return {
      message: "OK!",
      status: 201,
      affiliates,
    };
  }
}

import { GetRootCouponsForSelectDTO_I } from "./DTO";
import { GetRootCouponsForSelectRepository_I } from "./Repository";

export class GetRootCouponsForSelectUseCase {
  constructor(private repository: GetRootCouponsForSelectRepository_I) {}

  async run(dto: GetRootCouponsForSelectDTO_I) {
    return {
      message: "OK!",
      status: 200,
      coupons: await this.repository.fetch(),
    };
  }
}

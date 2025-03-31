import moment from "moment-timezone";
import { CreateCouponDTO_I } from "./DTO";
import { CreateCouponRepository_I } from "./Repository";

export class CreateCouponUseCase {
  constructor(private repository: CreateCouponRepository_I) {}

  async run({ rootId, ...dto }: CreateCouponDTO_I) {
    return {
      message: "OK!",
      status: 201,
      coupon: await this.repository.create({
        ...dto,
        ...(dto.validFrom && {
          validFrom: moment(dto.validFrom, "YYYY-MM-DD").add(1, "day").toDate(),
        }),
        ...(dto.validUntil && {
          validUntil: moment(dto.validUntil, "YYYY-MM-DD")
            .add(1, "day")
            .toDate(),
        }),
      }),
    };
  }
}

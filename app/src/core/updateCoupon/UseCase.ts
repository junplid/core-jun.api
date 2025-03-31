import moment from "moment-timezone";
import { UpdateCouponDTO_I } from "./DTO";
import { UpdateCouponRepository_I } from "./Repository";

export class UpdateCouponUseCase {
  constructor(private repository: UpdateCouponRepository_I) {}

  async run({ rootId, ...dto }: UpdateCouponDTO_I) {
    await this.repository.update({
      ...dto,
      applicableTo: dto.applicableTo?.length
        ? JSON.stringify(dto.applicableTo)
        : undefined,
      ...(dto.validFrom && {
        validFrom: moment(dto.validFrom, "YYYY-MM-DD").add(1, "day").toDate(),
      }),
      ...(dto.validUntil && {
        validUntil: moment(dto.validUntil, "YYYY-MM-DD").add(1, "day").toDate(),
      }),
    });
    return { message: "OK!", status: 201 };
  }
}

import { DeleteCouponParamsDTO_I } from "./DTO";
import { DeleteCouponRepository_I } from "./Repository";

export class DeleteCouponUseCase {
  constructor(private repository: DeleteCouponRepository_I) {}

  async run(dto: DeleteCouponParamsDTO_I) {
    await this.repository.del(dto.id);
    return { message: "OK!", status: 201 };
  }
}

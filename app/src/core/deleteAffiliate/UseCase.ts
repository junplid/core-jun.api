import { DeleteAffiliatesParamsDTO_I } from "./DTO";
import { DeleteAffiliatesRepository_I } from "./Repository";

export class DeleteAffiliatesUseCase {
  constructor(private repository: DeleteAffiliatesRepository_I) {}

  async run(dto: DeleteAffiliatesParamsDTO_I) {
    await this.repository.del(dto.id);
    return { message: "OK!", status: 201 };
  }
}

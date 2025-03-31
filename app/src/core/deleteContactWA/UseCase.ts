import { DeleteContactWARepository_I } from "./Repository";
import { DeleteContactWADTO_I } from "./DTO";

export class DeleteContactWAUseCase {
  constructor(private repository: DeleteContactWARepository_I) {}

  async run(dto: DeleteContactWADTO_I) {
    await this.repository.delete({
      id: dto.contactWAId,
    });

    return {
      message: "OK!",
      status: 200,
    };
  }
}

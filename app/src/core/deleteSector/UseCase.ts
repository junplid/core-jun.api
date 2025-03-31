import { DeleteSectorRepository_I } from "./Repository";
import { DeleteSectorDTO_I } from "./DTO";

export class DeleteSectorUseCase {
  constructor(private repository: DeleteSectorRepository_I) {}

  async run(dto: DeleteSectorDTO_I) {
    await this.repository.delete(dto);

    return {
      message: "OK!",
      status: 200,
    };
  }
}

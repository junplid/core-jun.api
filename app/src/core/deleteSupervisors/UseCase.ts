import { DeleteSupervisorRepository_I } from "./Repository";
import { DeleteSupervisorDTO_I } from "./DTO";

export class DeleteSupervisorUseCase {
  constructor(private repository: DeleteSupervisorRepository_I) {}

  async run(dto: DeleteSupervisorDTO_I) {
    await this.repository.delete(dto);

    return {
      message: "OK!",
      status: 200,
    };
  }
}

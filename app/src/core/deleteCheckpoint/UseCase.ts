import { ErrorResponse } from "../../utils/ErrorResponse";
import { DeleteCheckpointDTO_I } from "./DTO";
import { DeleteCheckpointRepository_I } from "./Repository";

export class DeleteCheckpointUseCase {
  constructor(private repository: DeleteCheckpointRepository_I) {}

  async run(dto: DeleteCheckpointDTO_I) {
    const exist = await this.repository.fetchExist(dto);

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Checkpoint não encontrado`,
        type: "error",
      });
    }

    await this.repository.delete(dto);

    return {
      message: "OK!",
      status: 200,
    };
  }
}

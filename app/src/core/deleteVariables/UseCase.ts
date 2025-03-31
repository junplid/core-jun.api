import { DeleteVariableRepository_I } from "./Repository";
import { DeleteVariableDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class DeleteVariableUseCase {
  constructor(private repository: DeleteVariableRepository_I) {}

  async run(dto: DeleteVariableDTO_I) {
    const fetchVariableId = await this.repository.fetchExist(dto);

    if (!fetchVariableId) {
      throw new ErrorResponse(400).toast({
        title: `Variável não encontrada`,
        type: "error",
      });
    }

    await this.repository.delete({ variableId: dto.variableId });

    return {
      message: "OK!",
      status: 200,
    };
  }
}

import { DeleteFlowRepository_I } from "./Repository";
import { DeleteFlowDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { mongo } from "../../adapters/mongo/connection";

export class DeleteFlowUseCase {
  constructor(private repository: DeleteFlowRepository_I) {}

  async run(dto: DeleteFlowDTO_I) {
    await mongo();
    const fetchVariableId = await this.repository.fetchExist(dto);

    if (!fetchVariableId) {
      throw new ErrorResponse(400).toast({
        title: `Fluxo não existe ou não esta autorizado`,
        type: "error",
      });
    }

    await this.repository.delete({ flowId: dto.flowId });

    return {
      message: "OK!",
      status: 200,
    };
  }
}

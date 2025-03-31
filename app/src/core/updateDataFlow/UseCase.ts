import { UpdateDataFlowRepository_I } from "./Repository";
import { UpdateDataFlowDTO_I } from "./DTO";
import { flowsMap } from "../../adapters/Baileys/Cache";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class UpdateDataFlowUseCase {
  constructor(private repository: UpdateDataFlowRepository_I) {}

  async run(dto: UpdateDataFlowDTO_I) {
    try {
      flowsMap.delete(String(dto.id));

      await this.repository.fetchAndUpdate(
        { _id: dto.id, accountId: dto.accountId },
        dto.data
      );

      return { message: "OK!", status: 200 };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Erro ao tentar atualizar fluxo`,
        type: "error",
      });
    }
  }
}

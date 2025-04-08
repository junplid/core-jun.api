import { UpdateDataFlowDTO_I } from "./DTO";
import { flowsMap } from "../../adapters/Baileys/Cache";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { ModelFlows } from "../../adapters/mongo/models/flows";

export class UpdateDataFlowUseCase {
  constructor() {}

  async run(dto: UpdateDataFlowDTO_I) {
    try {
      flowsMap.delete(String(dto.id));

      await ModelFlows.findOneAndUpdate(
        { accountId: dto.accountId, _id: dto.id },
        { $set: { data: dto.data } }
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

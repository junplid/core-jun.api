import { mongo } from "../../adapters/mongo/connection";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetFlowDTO_I } from "./DTO";

export class GetFlowUseCase {
  constructor() {}

  async run(dto: GetFlowDTO_I) {
    await mongo();
    const flow = await ModelFlows.findOne({
      accountId: dto.accountId,
      _id: dto.id,
    }).lean();

    if (!flow) {
      throw new ErrorResponse(400).toast({
        title: `Fluxo de conversa não foi encontrado`,
        type: "error",
      });
    }

    return {
      message: "OK!",
      status: 200,
      flows: {
        name: flow.name,
        businessIds: flow.businessIds,
        type: flow.type,
      },
    };
  }
}

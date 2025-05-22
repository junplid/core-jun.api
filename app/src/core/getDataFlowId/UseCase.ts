import { GetDataFlowIdDTO_I } from "./DTO";
import { ModelFlows } from "../../adapters/mongo/models/flows";

export class GetDataFlowIdUseCase {
  constructor() {}

  async run(dto: GetDataFlowIdDTO_I) {
    const data = await ModelFlows.aggregate([
      { $match: { _id: dto.id, accountId: dto.accountId } },
      {
        $project: {
          edges: "$data.edges",
          nodes: "$data.nodes",
          name: "$name",
          type: "$type",
          businessIds: "$businessIds",
        },
      },
    ]);
    if (!data) {
      throw {
        message: "Fluxo não encontrado",
        status: 404,
      };
    }

    const { _id, ...nextData } = data[0];
    return { message: "OK!", status: 200, flow: nextData };
  }
}

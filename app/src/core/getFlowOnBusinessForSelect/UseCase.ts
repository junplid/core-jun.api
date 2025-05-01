import { GetFlowOnBusinessForSelectDTO_I } from "./DTO";
import { ModelFlows } from "../../adapters/mongo/models/flows";

export class GetFlowOnBusinessForSelectUseCase {
  constructor() {}

  async run(dto: GetFlowOnBusinessForSelectDTO_I) {
    const data = await ModelFlows.aggregate([
      {
        $match: {
          ...(dto.name && { name: { $regex: dto.name, $options: "i" } }),
          accountId: dto.accountId,
          ...(dto.businessIds?.length && {
            businessIds: { $in: dto.businessIds },
          }),
          ...(dto.type?.length && { type: { $in: dto.type } }),
        },
      },
      { $project: { id: "$_id", name: "$name" } },
    ]);

    return {
      message: "OK!",
      status: 200,
      flows: data.map((f) => ({ id: f.id, name: f.name })),
    };
  }
}

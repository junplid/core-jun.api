import {
  GetFlowOnBusinessForSelectRepository_I,
  ResultFetch,
} from "./Repository";
import { ModelFlows } from "../../adapters/mongo/models/flows";

export class GetFlowOnBusinessForSelectImplementation
  implements GetFlowOnBusinessForSelectRepository_I
{
  constructor(private modelFlow = ModelFlows) {}

  async fetch(where: {
    accountId: number;
    businessIds: number[];
    type?: ("marketing" | "chatbot")[];
  }): Promise<ResultFetch[]> {
    try {
      const data = await this.modelFlow.aggregate([
        {
          $match: {
            accountId: where.accountId,
            businessIds: { $in: where.businessIds },
            ...(where.type?.length && { type: { $in: where.type } }),
          },
        },
        { $project: { id: "$_id", name: "$name" } },
      ]);

      return data.map((f) => ({ id: f.id, name: f.name }));
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Parameters`.");
    }
  }
}

import { GetDataFlowIdRepository_I } from "./Repository";
import { ModelFlows } from "../../adapters/mongo/models/flows";

export class CraeteFlowImplementation implements GetDataFlowIdRepository_I {
  constructor(private modelFlows = ModelFlows) {}

  async fetch(filter: { accountId: number; _id: number }): Promise<null | {
    nodes: any;
    edges: any;
    name: string;
    type: string;
    businessIds: number[];
  }> {
    try {
      console.log(filter);
      const data = await this.modelFlows.aggregate([
        { $match: filter },
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
      if (data) {
        const { _id, ...nextData } = data[0];
        return nextData;
      }
      return null;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `fetch`.");
    }
  }
}

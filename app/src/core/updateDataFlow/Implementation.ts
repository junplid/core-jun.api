import { UpdateDataFlowRepository_I } from "./Repository";
import { ModelFlows } from "../../adapters/mongo/models/flows";

export class CraeteFlowImplementation implements UpdateDataFlowRepository_I {
  constructor(private modelFlows = ModelFlows) {}

  async fetchAndUpdate(
    filter: { accountId: number; _id: number },
    data: any
  ): Promise<void> {
    try {
      await this.modelFlows.findOneAndUpdate(filter, {
        $set: { data },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `fetchAndUpdate`.");
    }
  }
}

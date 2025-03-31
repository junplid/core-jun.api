import { DeleteFlowRepository_I } from "./Repository";
import { ModelFlows } from "../../adapters/mongo/models/flows";

export class DeleteFlowImplementation implements DeleteFlowRepository_I {
  constructor(private modelFlows = ModelFlows) {}

  async delete(props: { flowId: number }): Promise<void> {
    try {
      await this.modelFlows.deleteOne({ _id: props.flowId });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Delete flow`.");
    }
  }

  async fetchExist(props: {
    flowId: number;
    accountId: number;
  }): Promise<number> {
    try {
      return await this.modelFlows.countDocuments({
        _id: props.flowId,
        accountId: props.accountId,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch flows`.");
    }
  }
}

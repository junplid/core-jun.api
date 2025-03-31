import { Document, Types } from "mongoose";
import { ModelFlowsDoc } from "../../adapters/mongo/models/flows";

export interface GetFlowsRepository_I {
  fetch(props: {
    accountId: number;
  }): Promise<
    (Document<unknown, {}, ModelFlowsDoc> &
      Omit<ModelFlowsDoc & { _id: Types.ObjectId }, never>)[]
  >;
  fetchBusiness(data: { businessIds: number[] }): Promise<string[]>;
}

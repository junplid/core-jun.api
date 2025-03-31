import { Prisma, PrismaClient } from "@prisma/client";
import { GetFlowsRepository_I } from "./Repository";
import { ModelFlows, ModelFlowsDoc } from "../../adapters/mongo/models/flows";
import { Document, Types } from "mongoose";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetFlowsImplementation implements GetFlowsRepository_I {
  constructor(
    private prisma: PrismaClient<
      Prisma.PrismaClientOptions,
      never,
      DefaultArgs
    >,
    private modelFlows = ModelFlows
  ) {}

  async fetchBusiness(data: { businessIds: number[] }): Promise<string[]> {
    try {
      const b = await this.prisma.business.findMany({
        where: { id: { in: data.businessIds } },
        select: { name: true },
      });
      return b.map((bv) => bv.name);
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Flow`.");
    }
  }

  async fetch({
    accountId,
  }: {
    accountId: number;
  }): Promise<
    (Document<unknown, {}, ModelFlowsDoc> &
      Omit<ModelFlowsDoc & { _id: Types.ObjectId }, never>)[]
  > {
    try {
      const flows = await this.modelFlows.find({
        accountId,
      });
      return flows;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

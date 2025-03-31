import { Prisma, PrismaClient } from "@prisma/client";
import { CreateFlowRepository_I, PropsCreate } from "./Repository";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class CraeteFlowImplementation implements CreateFlowRepository_I {
  constructor(
    private prisma: PrismaClient<
      Prisma.PrismaClientOptions,
      never,
      DefaultArgs
    >,
    private modelFlows = ModelFlows
  ) {}

  async create(data: PropsCreate): Promise<{ flowId: number }> {
    try {
      let nextId: null | number = null;
      const maxIdDocument = await this.modelFlows.findOne(
        {},
        {},
        { sort: { _id: -1 } }
      );
      if (maxIdDocument) nextId = maxIdDocument._id + 1;
      const flow = await this.modelFlows.create({
        ...{ ...data, _id: nextId ?? 1 },
        data: {
          metrics: {},
          nodes: [
            {
              id: "0",
              type: "nodeInitial",
              data: {
                // variables into node
                selects: {},
              },
              position: { x: 200, y: 200 },
            },
          ],
          edges: [],
        },
      });
      return { flowId: flow._id };
    } catch (error) {
      console.log("Error: ", error);
      throw new Error("Erro `Create Flow`.");
    }
  }

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

  async fetchExist({ name }: { name: string }): Promise<number> {
    try {
      // return await this.modelFlows.count({
      // });
      return 0;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

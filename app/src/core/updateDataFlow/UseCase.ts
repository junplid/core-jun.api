import { UpdateDataFlowDTO_I } from "./DTO";
import { cacheFlowsMap } from "../../adapters/Baileys/Cache";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { mongo } from "../../adapters/mongo/connection";

export class UpdateDataFlowUseCase {
  constructor() {}

  async run(dto: UpdateDataFlowDTO_I) {
    try {
      cacheFlowsMap.delete(dto.id);
      await mongo();

      if (dto.nodes) {
        for await (const change of dto.nodes) {
          if (change.type === "upset") {
            const alreadyExists = await ModelFlows.findOne(
              {
                _id: dto.id,
                accountId: dto.accountId,
                "data.nodes.id": change.node.id,
              },
              { "data.nodes.$": 1 }
            ).lean();

            if (alreadyExists?.data.nodes.length) {
              await ModelFlows.updateOne(
                { _id: dto.id, accountId: dto.accountId },
                { $set: { "data.nodes.$[elem]": change.node } },
                { arrayFilters: [{ "elem.id": change.node.id }] }
              );
            } else {
              await ModelFlows.updateOne(
                { _id: dto.id, accountId: dto.accountId },
                { $push: { "data.nodes": change.node } }
              );
            }
          }
          if (change.type === "delete") {
            await ModelFlows.updateOne(
              { _id: dto.id, accountId: dto.accountId },
              { $pull: { "data.nodes": { id: change.node.id } } }
            );
          }
        }
      }

      if (dto.edges) {
        for await (const change of dto.edges) {
          if (change.type === "upset") {
            const alreadyExists = await ModelFlows.findOne(
              {
                _id: dto.id,
                accountId: dto.accountId,
                "data.edges.id": change.edge.id,
              },
              { "data.edges.$": 1 }
            ).lean();

            if (alreadyExists?.data.edges.length) {
              await ModelFlows.updateOne(
                { _id: dto.id, accountId: dto.accountId },
                { $set: { "data.edges.$[elem]": change.edge } },
                { arrayFilters: [{ "elem.id": change.edge.id }] }
              );
            } else {
              await ModelFlows.updateOne(
                { _id: dto.id, accountId: dto.accountId },
                { $push: { "data.edges": change.edge } }
              );
            }
          }
          if (change.type === "delete") {
            await ModelFlows.updateOne(
              { _id: dto.id, accountId: dto.accountId },
              { $pull: { "data.edges": { id: change.edge.id } } }
            );
          }
        }
      }

      return { message: "OK!", status: 200 };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Erro ao tentar atualizar fluxo`,
        type: "error",
      });
    }
  }
}

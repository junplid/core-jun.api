import { mongo } from "../../adapters/mongo/connection";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateFlowDTO_I } from "./DTO";

export class UpdateFlowUseCase {
  constructor() {}

  async run({ accountId, id, ...dto }: UpdateFlowDTO_I) {
    try {
      await mongo();
      const nextFlow = await ModelFlows.findOneAndUpdate(
        { _id: id, accountId },
        { $set: dto }
      ).lean();

      if (!nextFlow) {
        throw new ErrorResponse(400).toast({
          title: `Fluxo de conversa não foi encontrado`,
          type: "error",
        });
      }
      const businesses = await prisma.business.findMany({
        where: { id: { in: dto.businessIds } },
        select: { name: true, id: true },
      });

      return {
        message: "OK!",
        status: 200,
        flow: { businesses, updateAt: nextFlow.updatedAt },
      };
    } catch (error) {
      console.log("Error", error);
      throw new ErrorResponse(400).toast({
        title: `Erro ao tentar atualizar fluxo`,
        type: "error",
      });
    }
  }
}

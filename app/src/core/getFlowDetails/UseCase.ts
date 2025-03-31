import { ModelFlows } from "../../adapters/mongo/models/flows";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetFlowDetailsDTO_I } from "./DTO";

export class GetFlowDetailsUseCase {
  constructor() {}

  async run(dto: GetFlowDetailsDTO_I) {
    const flow = await ModelFlows.findOne({
      accountId: dto.accountId,
      _id: dto.id,
    });

    if (!flow) {
      throw new ErrorResponse(400).toast({
        title: `Fluxo de conversa não foi encontrado`,
        type: "error",
      });
    }

    const business = await prisma.business.findMany({
      where: { id: { in: flow.businessIds } },
      select: { name: true, id: true },
    });

    return {
      message: "OK!",
      status: 201,
      flows: {
        name: flow.name,
        business,
        type: flow.type,
      },
    };
  }
}

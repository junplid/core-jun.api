import { CreateFlowDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateFlowUseCase {
  constructor() {}

  async run({ businessIds, ...dto }: CreateFlowDTO_I) {
    const countResource = await ModelFlows.count({
      accountId: dto.accountId,
    });

    if (countResource > 1) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Limite de construtores de fluxo atingido.",
      });
    }

    const existName = await ModelFlows.count({
      name: dto.name,
      accountId: dto.accountId,
      businessIds: businessIds || [],
    });

    if (existName) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Já existe com esse nome",
      });
    }

    let nextId: null | number = null;
    const maxIdDocument = await ModelFlows.findOne(
      {},
      {},
      { sort: { _id: -1 } }
    );
    if (maxIdDocument) nextId = maxIdDocument._id + 1;
    const flow = await ModelFlows.create({
      ...{ ...dto, _id: nextId ?? 1 },
      data: {
        metrics: {},
        nodes: [
          {
            id: "0",
            type: "nodeInitial",
            data: { selects: {} },
            position: { x: 100, y: 200 },
            deletable: false,
          },
        ],
        edges: [],
      },
    });

    const businesses = await prisma.business.findMany({
      where: { id: { in: businessIds || [] } },
      select: { name: true, id: true },
    });

    return {
      message: "OK!",
      status: 201,
      flow: {
        id: flow._id,
        businesses,
        createAt: flow.createdAt,
        updateAt: flow.updatedAt,
      },
    };
  }
}

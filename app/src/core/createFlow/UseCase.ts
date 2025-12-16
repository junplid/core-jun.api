import { CreateFlowDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { ulid } from "ulid";
import { mongo } from "../../adapters/mongo/connection";

export class CreateFlowUseCase {
  constructor() {}

  async run({ businessIds, ...dto }: CreateFlowDTO_I) {
    console.log("1");
    await mongo();
    console.log("2");
    const getAccount = await prisma.account.findFirst({
      where: { id: dto.accountId },
      select: { isPremium: true },
    });
    if (!getAccount) throw new ErrorResponse(400).container("Não autorizado.");

    const countResource = await ModelFlows.count({
      accountId: dto.accountId,
    });

    if (!getAccount.isPremium && countResource > 1) {
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

    const flow = await ModelFlows.create({
      ...{ ...dto, _id: ulid() },
      data: {
        metrics: {},
        nodes: [
          {
            id: "0",
            type: "NodeInitial",
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

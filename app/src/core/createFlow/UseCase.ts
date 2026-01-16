import { CreateFlowDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { ulid } from "ulid";
import { mongo } from "../../adapters/mongo/connection";

export class CreateFlowUseCase {
  constructor() {}

  async run({ businessIds, agentId: agentIdDto, ...dto }: CreateFlowDTO_I) {
    await mongo();
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

    const nodes: any = [
      {
        id: "0",
        type: "NodeInitial",
        data: { selects: {} },
        position: { x: 100, y: 200 },
        deletable: false,
      },
    ];
    const edges: any = [];

    if (agentIdDto) {
      nodes.push({
        id: "v3D0oW8JysPIgmuzlo6D5",
        type: "NodeAgentAI",
        data: { selects: {}, agentId: agentIdDto },
        position: { x: 230, y: 200 },
        deletable: false,
      });
      edges.push({
        id: "xy-edge__0main-v3D0oW8JysPIgmuzlo6D5",
        source: "0",
        target: "v3D0oW8JysPIgmuzlo6D5",
        sourceHandle: "main",
      });
    }

    const flow = await ModelFlows.create({
      ...{ ...dto, agentId: agentIdDto, _id: ulid() },
      data: {
        metrics: {},
        nodes,
        edges,
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

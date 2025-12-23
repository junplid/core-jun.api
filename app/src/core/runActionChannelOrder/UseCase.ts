import { RunActionChannelOrderDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { cacheFlowsMap } from "../../adapters/Baileys/Cache";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { NodeControler } from "../../libs/FlowBuilder/Control";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { mongo } from "../../adapters/mongo/connection";

export class RunActionChannelOrderUseCase {
  constructor() {}

  async run({ action, ...dto }: RunActionChannelOrderDTO_I) {
    const order = await prisma.orders.findFirst({
      where: { ...dto, deleted: false },
      select: {
        flowNodeId: true,
        flowId: true,
        ConnectionWA: { select: { number: true, id: true } },
        ContactsWAOnAccount: {
          select: {
            id: true,
            ContactsWA: { select: { completeNumber: true } },
          },
        },
        flowStateId: true,
        Business: { select: { name: true } },
      },
    });

    if (!order) {
      throw new ErrorResponse(400).toast({
        title: "Não foi possivel encontrar o pedido",
        type: "error",
      });
    }

    if (!order?.flowId) {
      throw new ErrorResponse(400).toast({
        title: "Não foi possivel encontrar o fluxo do pedido",
        type: "error",
      });
    }

    if (!order?.flowStateId) {
      throw new ErrorResponse(400).toast({
        title: "Não foi possivel encontrar o registro do atendimento.",
        type: "error",
      });
    }

    if (!order.flowNodeId) {
      throw new ErrorResponse(400).toast({
        title: "Ação não executada.",
        description: "Node não encontrado no fluxo.",
        type: "error",
      });
    }

    if (!order.ContactsWAOnAccount?.ContactsWA) {
      throw new ErrorResponse(400).toast({
        title: "Ação não executada.",
        description: "Contato não encontrado.",
        type: "error",
      });
    }

    if (!order.ConnectionWA?.id) {
      throw new ErrorResponse(400).toast({
        title: "Ação não executada.",
        description: "Conexão WA não encontrada.",
        type: "error",
      });
    }
    const bot = sessionsBaileysWA.get(order.ConnectionWA.id);
    if (!bot) {
      throw new ErrorResponse(400).toast({
        title: "Ação não executada.",
        description: "Conexão WA OFFLINE.",
        type: "error",
      });
    }

    let flow: { edges: any[]; nodes: any[]; businessIds: number[] } | undefined;
    flow = cacheFlowsMap.get(order.flowId);
    if (!flow) {
      await mongo();
      const flowFetch = await ModelFlows.aggregate([
        {
          $match: { accountId: dto.accountId, _id: order.flowId },
        },
        {
          $project: {
            businessIds: 1,
            nodes: {
              $map: {
                input: "$data.nodes",
                in: {
                  id: "$$this.id",
                  type: "$$this.type",
                  data: "$$this.data",
                },
              },
            },
            edges: {
              $map: {
                input: "$data.edges",
                in: {
                  id: "$$this.id",
                  source: "$$this.source",
                  target: "$$this.target",
                  sourceHandle: "$$this.sourceHandle",
                },
              },
            },
          },
        },
      ]);
      if (!flowFetch?.length) return console.log(`Flow not found.`);
      const { edges, nodes, businessIds } = flowFetch[0];
      flow = { edges, nodes, businessIds };
      cacheFlowsMap.set(order.flowId, flow);
    }

    const orderNode = flow.nodes.find(
      (n: any) => n.type === "NodeCreateOrder" && n.id === order.flowNodeId
    ) as any;

    if (!orderNode) {
      throw new ErrorResponse(400).toast({
        title: "Ação não executada.",
        description: "Node não encontrado no fluxo.",
        type: "error",
      });
    }

    const number = order.ContactsWAOnAccount.ContactsWA.completeNumber;

    NodeControler({
      forceFinish: true,
      businessName: order.Business.name,
      flowId: order.flowId,
      flowBusinessIds: flow!.businessIds,
      type: "running",
      action,
      connectionWhatsId: order.ConnectionWA.id,
      oldNodeId: orderNode.id,
      currentNodeId: orderNode.id,
      message: action,
      clientWA: bot,
      isSavePositionLead: false,
      flowStateId: order.flowStateId,
      contactsWAOnAccountId: order.ContactsWAOnAccount.id,
      lead: { number },
      edges: flow.edges,
      nodes: flow.nodes,
      numberConnection: order.ConnectionWA.number + "@s.whatsapp.net",
      accountId: dto.accountId,
    });

    return { message: "OK!" };
  }
}

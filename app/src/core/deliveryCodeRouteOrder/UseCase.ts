import { sessionsBaileysWA } from "../../adapters/Baileys";
import {
  cacheConnectionsWAOnline,
  cacheFlowsMap,
} from "../../adapters/Baileys/Cache";
import { mongo } from "../../adapters/mongo/connection";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { prisma } from "../../adapters/Prisma/client";
import { webSocketEmitToRoom } from "../../infra/websocket";
import { NodeControler } from "../../libs/FlowBuilder/Control";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { DeliveryCodeRouteOrderDTO_I } from "./DTO";

export class DeliveryCodeRouteOrderUseCase {
  constructor() {}

  async run(dto: DeliveryCodeRouteOrderDTO_I) {
    const getRouter = await prisma.deliveryRouter.findFirst({
      where: {
        n_router: dto.code,
        ContactsWAOnAccount: { ContactsWA: { completeNumber: dto.nlid } },
        status: "in_progress",
      },
      select: {
        menuOnline: { select: { accountId: true } },
        status: true,
        DeliveryRouterOnOrders: {
          take: 1,
          select: {
            id: true,
            Order: {
              select: {
                status: true,
                n_order: true,
                id: true,
                FlowState: {
                  select: {
                    id: true,
                    previous_response_id: true,
                    flowId: true,
                    ConnectionWA: {
                      select: {
                        id: true,
                        Business: { select: { name: true, id: true } },
                      },
                    },
                    ContactsWAOnAccount: {
                      select: {
                        id: true,
                        ContactsWA: {
                          select: { completeNumber: true },
                        },
                      },
                    },
                    campaignId: true,
                    chatbotId: true,
                  },
                },
              },
            },
          },
          where: { Order: { delivery_code: dto.delivery_code } },
        },
      },
    });

    if (!getRouter) {
      throw new ErrorResponse(400).toast({
        title: "Rota não encontrada.",
        description: "Esta ação não pôde ser concluída.",
        placement: "bottom",
        type: "error",
      });
    }

    if (getRouter.status === "finished") {
      throw new ErrorResponse(400).toast({
        title: "Rota está finalizada",
        description: "Esta ação não pôde ser concluída.",
        placement: "bottom",
        type: "error",
      });
    }

    if (!getRouter.DeliveryRouterOnOrders.length) {
      throw new ErrorResponse(400).toast({
        title: "Pedido não encontrado",
        description: "Esta ação não pôde ser concluída.",
        placement: "bottom",
        type: "error",
      });
    }

    const {
      FlowState,
      id: orderId,
      ...order
    } = getRouter.DeliveryRouterOnOrders[0].Order;
    const accountId = getRouter.menuOnline.accountId;

    if (
      !FlowState ||
      !FlowState?.flowId ||
      !FlowState.ConnectionWA?.id ||
      !FlowState.ContactsWAOnAccount?.ContactsWA.completeNumber
    ) {
      throw new ErrorResponse(400).toast({
        title: "Atendimento do cliente não encontrado",
        description: "Esta ação não pôde ser concluída.",
        placement: "bottom",
        type: "error",
      });
    }

    const {
      flowId,
      ConnectionWA,
      ContactsWAOnAccount,
      campaignId,
      chatbotId,
      previous_response_id,
    } = FlowState;

    let flow: any = null;
    flow = cacheFlowsMap.get(flowId);
    if (!flow) {
      await mongo();
      const flowFetch = await ModelFlows.aggregate([
        { $match: { accountId, _id: flowId } },
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
      if (!flowFetch?.length) {
        throw new ErrorResponse(400).toast({
          title: "Gancho de atendimento não encontrado",
          description: "Esta ação não pôde ser concluída.",
          placement: "bottom",
          type: "error",
        });
      }

      const { edges, nodes, businessIds } = flowFetch[0];
      flow = { edges, nodes, businessIds };
      cacheFlowsMap.set(flowId, flow);
    }

    const GAP = 640;
    const last = await prisma.orders.findFirst({
      where: { accountId, status: "completed" },
      orderBy: { rank: "desc" },
      select: { rank: true },
    });
    const newRank = last ? last.rank.plus(GAP) : GAP;

    await prisma.orders.update({
      where: { id: orderId },
      data: { status: "completed", completedAt: new Date() },
    });
    await prisma.deliveryRouterOnOrders.update({
      where: { id: getRouter.DeliveryRouterOnOrders[0].id },
      data: { completedAt: new Date() },
    });
    const socketOrders = webSocketEmitToRoom().account(accountId).orders;
    socketOrders.update_status(
      {
        rank: newRank,
        orderId,
        sourceStatus: order.status,
        nextStatus: "completed",
      },
      [],
    );
    socketOrders.update_order({ id: orderId, status: "completed" }, []);

    const Node = flow.nodes.find(
      (n: any) => n.type === "NodeCreateOrder",
    ) as any;

    if (!Node) {
      throw new ErrorResponse(400).toast({
        title: "Nó Order não encontrado",
        description: "Esta ação não pôde ser concluída.",
        placement: "bottom",
        type: "error",
      });
    }

    const nextEdgesIds = flow.edges
      .filter((f: any) => Node?.id === f.source)
      ?.map((nn: any) => {
        return {
          id: nn.target,
          sourceHandle: nn.sourceHandle,
        };
      });

    const nextNode: any = nextEdgesIds?.find((nd: any) =>
      nd.sourceHandle?.includes("completed"),
    );

    if (nextNode) {
      let external_adapter: (any & { businessName: string }) | null = null;

      if (ConnectionWA.id) {
        let attempt = 0;
        const botOnline = new Promise<boolean>((resolve, reject) => {
          function run() {
            if (attempt >= 5) {
              return resolve(false);
            } else {
              setInterval(async () => {
                const botWA = cacheConnectionsWAOnline.get(ConnectionWA.id!);
                if (!botWA) {
                  attempt++;
                  return run();
                } else {
                  return resolve(botWA);
                }
              }, 1000 * attempt);
            }
          }
          return run();
        });

        const clientWA = sessionsBaileysWA.get(ConnectionWA.id)!;
        external_adapter = {
          type: "baileys",
          clientWA: clientWA,
          businessName: ConnectionWA.Business.name,
        };
      }

      if (!external_adapter) {
        throw new ErrorResponse(400).toast({
          title: "Conexão da loja está OFF.",
          description: "Comunicar ao responsável imediatamente.",
          placement: "bottom",
          type: "info",
        });
      }

      const connectionId = ConnectionWA.id;

      NodeControler({
        businessName: external_adapter.businessName,
        mode: "prod",
        flowId: flowId,
        flowBusinessIds: flow.businessIds,
        businessId: ConnectionWA.Business.id,

        type: "running",
        action: null,
        message: `CODE_ROUTER=${dto.code}\nCODE_ORDER=${order.n_order}`,

        external_adapter,
        connectionId,
        lead_id: ContactsWAOnAccount.ContactsWA.completeNumber,
        contactAccountId: ContactsWAOnAccount.id,

        chatbotId: chatbotId || undefined,
        campaignId: campaignId || undefined,
        oldNodeId: nextNode.id,
        previous_response_id: previous_response_id || undefined,
        isSavePositionLead: false,
        flowStateId: FlowState.id,
        currentNodeId: nextNode.id,
        edges: flow.edges,
        nodes: flow.nodes,
        accountId,
      });
    }

    return {
      status: 200,
      message: "OK!",
      order: { status: "completed", n_order: order.n_order },
    };
  }
}

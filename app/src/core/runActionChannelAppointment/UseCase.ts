import { RunActionChannelOrderDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import {
  cacheConnectionsWAOnline,
  cacheFlowsMap,
} from "../../adapters/Baileys/Cache";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { IPropsControler, NodeControler } from "../../libs/FlowBuilder/Control";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { mongo } from "../../adapters/mongo/connection";
import { decrypte } from "../../libs/encryption";

export class RunActionChannelOrderUseCase {
  constructor() {}

  async run({ action, ...dto }: RunActionChannelOrderDTO_I) {
    const order = await prisma.orders.findFirst({
      where: { ...dto, deleted: false },
      select: {
        flowNodeId: true,
        flowId: true,
        ConnectionWA: { select: { number: true, id: true } },
        ConnectionIg: {
          select: { credentials: true, id: true, page_id: true },
        },
        FlowState: {
          select: { previous_response_id: true },
        },
        ContactsWAOnAccount: {
          select: {
            id: true,
            ContactsWA: { select: { completeNumber: true } },
          },
        },
        flowStateId: true,
        Business: { select: { name: true, id: true } },
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
        description: "conexão não encontrada.",
        type: "error",
      });
    }

    let external_adapter: IPropsControler["external_adapter"] | null = null;

    if (order.ConnectionWA?.id) {
      let attempt = 0;
      const botOnline = new Promise<boolean>((resolve, reject) => {
        function run() {
          if (attempt >= 5) {
            return resolve(false);
          } else {
            setInterval(async () => {
              const botWA = cacheConnectionsWAOnline.get(
                order!.ConnectionWA?.id!,
              );
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

      if (!botOnline) {
        throw new ErrorResponse(400).toast({
          title: "Ação não executada.",
          description: "conexão OFFLINE.",
          type: "error",
        });
      }

      const clientWA = sessionsBaileysWA.get(order.ConnectionWA?.id!)!;
      external_adapter = { type: "baileys", clientWA: clientWA };
    }
    if (order.ConnectionIg?.id) {
      try {
        const credential = decrypte(order.ConnectionIg.credentials);
        external_adapter = {
          type: "instagram",
          page_token: credential.account_access_token,
        };
      } catch (error) {
        throw new ErrorResponse(400).toast({
          title: "Falha ao descriptografar credencias.",
          description:
            "Servidor negou o acesso ao dados de Integração do Instagram.",
          type: "error",
        });
      }
    }

    if (!external_adapter) {
      throw new ErrorResponse(400).toast({
        title: "Error interno.",
        description: "Conexão ou integração não encontrada.",
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
      (n: any) => n.type === "NodeCreateOrder" && n.id === order.flowNodeId,
    ) as any;

    if (!orderNode) {
      throw new ErrorResponse(400).toast({
        title: "Ação não executada.",
        description: "Node não encontrado no fluxo.",
        type: "error",
      });
    }

    const number = order.ContactsWAOnAccount.ContactsWA.completeNumber;
    const connectionId = (order.ConnectionWA?.id || order.ConnectionIg?.id)!;

    NodeControler({
      forceFinish: true,
      businessName: order.Business.name,
      flowId: order.flowId,
      flowBusinessIds: flow!.businessIds,
      type: "running",
      action: `${action} [appointment-${dto.id}]`,
      businessId: order.Business.id,

      external_adapter,
      connectionId,
      lead_id: number,
      contactAccountId: order.ContactsWAOnAccount.id,

      oldNodeId: orderNode.id,
      currentNodeId: orderNode.id,
      message: action,
      isSavePositionLead: false,
      flowStateId: order.flowStateId,
      // previewus do agent
      previous_response_id: order.FlowState?.previous_response_id || undefined,
      edges: flow.edges,
      nodes: flow.nodes,
      accountId: dto.accountId,
    });

    return { message: "OK!" };
  }
}

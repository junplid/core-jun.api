import { sessionsBaileysWA } from "../../adapters/Baileys";
import {
  cacheConnectionsWAOnline,
  cacheFlowsMap,
} from "../../adapters/Baileys/Cache";
import { mongo } from "../../adapters/mongo/connection";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { prisma } from "../../adapters/Prisma/client";
import { NodeControler } from "../../libs/FlowBuilder/Control";
import { JoinRouterDTO_I } from "./DTO";

export class JoinRouterUseCase {
  constructor() {}

  async run(dto: JoinRouterDTO_I) {
    const [getRouter, getFlowState] = await Promise.all([
      prisma.deliveryRouter.findFirst({
        where: {
          n_router: dto.code,
          status: { in: ["awaiting_assignment", "open"] },
          contactsWAOnAccountId: null,
        },
        select: { menuOnline: { select: { accountId: true } } },
      }),
      prisma.flowState.findFirst({
        where: { id: dto.fsid },
        select: {
          id: true,
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
      }),
    ]);

    if (!getRouter) {
      return {
        message: "Rota não encontrada ou já foi atribuída a um entregador.",
      };
    }

    if (!getFlowState) return { message: "Flow da rota não encontrada!" };

    const accountId = getRouter.menuOnline.accountId;

    const getcontact = await prisma.contactsWAOnAccount.findFirst({
      where: {
        accountId: getRouter.menuOnline.accountId,
        ContactsWA: { completeNumber: dto.nlid },
      },
      select: { id: true },
    });

    if (!getcontact?.id) {
      return {
        message: "Não autorizado!",
      };
    }

    let dataStateFlow = {} as {
      id: number;
      ContactsWAOnAccount: {
        id: number;
        ContactsWA: {
          completeNumber: string;
        };
      } | null;
      ConnectionWA: {
        id: number;
        Business: {
          id: number;
          name: string;
        };
      } | null;
      flowId: string | null;
      previous_response_id: string | null;
      campaignId: number | null;
      chatbotId: number | null;
    };

    const flowOpenContactAccount = await prisma.flowState.findFirst({
      where: { contactsWAOnAccountId: getcontact.id, isFinish: false },
      select: {
        id: true,
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
        previous_response_id: true,
      },
    });

    if (flowOpenContactAccount) {
      dataStateFlow = flowOpenContactAccount;
    } else {
      try {
        const { id } = await prisma.flowState.create({
          data: {
            flowId: getFlowState.flowId,
            connectionWAId: getFlowState.ConnectionWA?.id,
            contactsWAOnAccountId: getcontact.id,
            chatbotId: getFlowState.chatbotId,
            campaignId: getFlowState.campaignId,
            indexNode: "0",
          },
          select: { id: true },
        });
        dataStateFlow = {
          chatbotId: getFlowState.chatbotId,
          campaignId: getFlowState.campaignId,
          ConnectionWA: getFlowState.ConnectionWA,
          ContactsWAOnAccount: getFlowState.ContactsWAOnAccount,
          flowId: getFlowState.flowId,
          id,
          previous_response_id: null,
        };
      } catch (error) {
        return { message: "Error ao criar FlowS" };
      }
    }

    if (
      !dataStateFlow?.flowId ||
      !dataStateFlow.ConnectionWA?.id ||
      !dataStateFlow.ContactsWAOnAccount?.ContactsWA.completeNumber
    ) {
      return { message: "Error: dados do FlowS não encontrado." };
    }

    const {
      flowId,
      ConnectionWA,
      ContactsWAOnAccount,
      campaignId,
      chatbotId,
      previous_response_id,
    } = dataStateFlow;

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
      if (!flowFetch?.length)
        return { message: "Fluxo de automação não encontrado." };
      const { edges, nodes, businessIds } = flowFetch[0];
      flow = { edges, nodes, businessIds };
      cacheFlowsMap.set(flowId, flow);
    }

    const Node = flow.nodes.find(
      (n: any) => n.type === "NodeRouterAcceptance",
    ) as any;

    if (!Node)
      return {
        message:
          "Nó de aceitação da rota no fluxo de automação não encontrado.",
      };

    const nextEdgesIds = flow.edges
      .filter((f: any) => Node?.id === f.source)
      ?.map((nn: any) => {
        return {
          id: nn.target,
          sourceHandle: nn.sourceHandle,
        };
      });

    const nextNode: any = nextEdgesIds?.find((nd: any) =>
      nd.sourceHandle?.includes("main"),
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

        if (!botOnline)
          return {
            message:
              "Conexão WhatsApp da loja desconectada. O sistema tentou conectar 5x, mas sem sucesso! Entre em contato com a direção da loja ou mande uma mensagem para: 71986751101.",
          };

        const clientWA = sessionsBaileysWA.get(ConnectionWA.id)!;
        external_adapter = {
          type: "baileys",
          clientWA: clientWA,
          businessName: ConnectionWA.Business.name,
        };
      }

      if (!external_adapter)
        return {
          message:
            "Conexão WhatsApp da loja desconectada. O sistema tentou conectar 5x, mas sem sucesso! Entre em contato com a direção da loja ou mande uma mensagem para: 71986751101.",
        };

      const connectionId = ConnectionWA.id;

      NodeControler({
        businessName: external_adapter.businessName,
        mode: "prod",
        flowId: flowId,
        flowBusinessIds: flow.businessIds,
        businessId: ConnectionWA.Business.id,

        type: "running",
        action: null,
        message: `CODE_ROUTER=${dto.code}`,

        external_adapter,
        connectionId,
        lead_id: ContactsWAOnAccount.ContactsWA.completeNumber,
        contactAccountId: ContactsWAOnAccount.id,

        chatbotId: chatbotId || undefined,
        campaignId: campaignId || undefined,
        oldNodeId: nextNode.id,
        previous_response_id: previous_response_id || undefined,
        isSavePositionLead: false,
        flowStateId: dataStateFlow.id,
        currentNodeId: nextNode.id,
        edges: flow.edges,
        nodes: flow.nodes,
        accountId,
      });
    }

    return {
      status: 200,
      message: "Rota garantida! Estará disponível em poucos minutos.",
    };
  }
}

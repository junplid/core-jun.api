import { sessionsBaileysWA } from "../../adapters/Baileys";
import {
  cacheConnectionsWAOnline,
  cacheFlowsMap,
} from "../../adapters/Baileys/Cache";
import { mongo } from "../../adapters/mongo/connection";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { prisma } from "../../adapters/Prisma/client";
import { NodeControler } from "../../libs/FlowBuilder/Control";
import { ErrorResponse } from "../../utils/ErrorResponse";
import {
  buildRoute,
  generateGoogleMapsLink,
} from "../../utils/generate-router-google";
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
        select: {
          id: true,
          menuOnline: {
            select: {
              accountId: true,
              titlePage: true,
              logoImg: true,
              MenuInfo: { select: { lat: true, lng: true } },
            },
          },
          DeliveryRouterOnOrders: {
            select: {
              Order: {
                select: {
                  delivery_lat: true,
                  delivery_lng: true,
                },
              },
            },
          },
        },
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
      throw new ErrorResponse(400).toast({
        title: "Rota não encontrada.",
        description: "Esta ação não pôde ser concluída.",
        placement: "bottom",
        type: "error",
      });
    }

    if (!getFlowState) {
      throw new ErrorResponse(400).toast({
        title: "Não encontrado",
        description: "Esta ação não pôde ser concluída.",
        placement: "bottom",
        type: "error",
      });
    }

    const accountId = getRouter.menuOnline.accountId;

    const getcontact = await prisma.contactsWAOnAccount.findFirst({
      where: {
        accountId: getRouter.menuOnline.accountId,
        ContactsWA: { completeNumber: dto.nlid },
      },
      select: { id: true },
    });

    if (!getcontact?.id) {
      throw new ErrorResponse(400).toast({
        title: "Não autorizado",
        description: "Esta ação não pôde ser concluída.",
        placement: "bottom",
        type: "error",
      });
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
        throw new ErrorResponse(400).toast({
          title: "Error ao criar FlowS",
          description: "Esta ação não pôde ser concluída.",
          placement: "bottom",
          type: "error",
        });
      }
    }

    if (
      !dataStateFlow?.flowId ||
      !dataStateFlow.ConnectionWA?.id ||
      !dataStateFlow.ContactsWAOnAccount?.ContactsWA.completeNumber
    ) {
      throw new ErrorResponse(400).toast({
        title: "Dados do FlowS não encontrado",
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

    const Node = flow.nodes.find(
      (n: any) => n.type === "NodeRouterAcceptance",
    ) as any;

    if (Node) {
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

          if (!botOnline) {
            throw new ErrorResponse(400).toast({
              title: "Conexão da loja está OFF.",
              description: "Comunicar ao responsável imediatamente.",
              placement: "bottom",
              type: "error",
            });
          }

          const clientWA = sessionsBaileysWA.get(ConnectionWA.id)!;
          external_adapter = {
            type: "baileys",
            clientWA: clientWA,
            businessName: ConnectionWA.Business.name,
          };
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
    }

    let router_link: undefined | string = undefined;

    // @ts-expect-error
    let origin: { lat: number; lng: number } = {};

    if (
      getRouter.menuOnline.MenuInfo?.lat &&
      getRouter.menuOnline.MenuInfo?.lng
    ) {
      origin = {
        lat: getRouter.menuOnline.MenuInfo.lat,
        lng: getRouter.menuOnline.MenuInfo.lng,
      };

      const filterLatLng = getRouter.DeliveryRouterOnOrders.map((s) => {
        if (!s.Order.delivery_lat || !s.Order.delivery_lng) return;
        return {
          lat: s.Order.delivery_lat,
          lng: s.Order.delivery_lng,
        };
      }).filter((s) => s) as { lat: number; lng: number }[];

      const ordered = buildRoute(origin, filterLatLng);
      router_link = generateGoogleMapsLink(origin, ordered, undefined);
    }

    await prisma.deliveryRouter.update({
      where: { id: getRouter.id },
      data: { status: "in_progress" },
    });

    // enviar socket para os outros links dessa rota.

    return {
      status: 200,
      message: "OK",
      router: {
        router_link,
        status: "in_progress",
      },
    };
  }
}

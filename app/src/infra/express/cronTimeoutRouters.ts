import cron from "node-cron";
import { prisma } from "../../adapters/Prisma/client";
import {
  cacheConnectionsWAOnline,
  cacheFlowsMap,
} from "../../adapters/Baileys/Cache";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { mongo } from "../../adapters/mongo/connection";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { NodeControler } from "../../libs/FlowBuilder/Control";

cron.schedule("* * * * *", () => {
  (async () => {
    try {
      const routers = await prisma.deliveryRouter.findMany({
        where: {
          timeoutAt: { lt: new Date() },
          status: "open",
          isNotify: false,
        },
        select: {
          _count: { select: { DeliveryRouterOnOrders: true } },
          flowStateId: true,
          nodeId: true,
          menuOnline: { select: { accountId: true } },
          n_router: true,
          id: true,
        },
      });
      if (routers.length) {
        routers.forEach(
          async ({
            flowStateId,
            nodeId,
            menuOnline: { accountId },
            n_router,
            _count,
            id,
          }) => {
            if (!_count.DeliveryRouterOnOrders) {
              await prisma.deliveryRouter.delete({ where: { id } });
              return;
            }
            await prisma.deliveryRouter.update({
              where: { id },
              data: { isNotify: true },
            });
            const getFlowState = await prisma.flowState.findFirst({
              where: { id: flowStateId },
              select: {
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
            if (
              !getFlowState?.flowId ||
              !getFlowState.ConnectionWA?.id ||
              !getFlowState.ContactsWAOnAccount?.ContactsWA.completeNumber
            ) {
              return;
            }

            const {
              flowId,
              ConnectionWA,
              ContactsWAOnAccount,
              campaignId,
              chatbotId,
              previous_response_id,
            } = getFlowState;

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
              if (!flowFetch?.length) return;
              const { edges, nodes, businessIds } = flowFetch[0];
              flow = { edges, nodes, businessIds };
              cacheFlowsMap.set(flowId, flow);
            }

            const routerNode = flow.nodes.find(
              (n: any) => n.id === nodeId,
            ) as any;

            if (!routerNode) return;

            const nextEdgesIds = flow.edges
              .filter((f: any) => routerNode?.id === f.source)
              ?.map((nn: any) => {
                return {
                  id: nn.target,
                  sourceHandle: nn.sourceHandle,
                };
              });

            const nextNode: any = nextEdgesIds?.find((nd: any) =>
              nd.sourceHandle?.includes("timeout"),
            );

            if (nextNode) {
              let external_adapter: (any & { businessName: string }) | null =
                null;

              if (ConnectionWA?.id) {
                let attempt = 0;
                const botOnline = new Promise<boolean>((resolve, reject) => {
                  function run() {
                    if (attempt >= 5) {
                      return resolve(false);
                    } else {
                      setInterval(async () => {
                        const botWA = cacheConnectionsWAOnline.get(
                          ConnectionWA?.id!,
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

                if (!botOnline) return;

                const clientWA = sessionsBaileysWA.get(ConnectionWA.id)!;
                external_adapter = {
                  type: "baileys",
                  clientWA: clientWA,
                  businessName: ConnectionWA.Business.name,
                };
              }

              if (!external_adapter) return;

              const connectionId = ConnectionWA.id;

              NodeControler({
                businessName: external_adapter.businessName,
                mode: "prod",
                flowId: flowId,
                flowBusinessIds: flow.businessIds,
                businessId: ConnectionWA.Business.id,

                type: "running",
                action: null,
                message: `CODE_ROUTER=${n_router}`,

                external_adapter,
                connectionId,
                lead_id: ContactsWAOnAccount.ContactsWA.completeNumber,
                contactAccountId: ContactsWAOnAccount.id,

                chatbotId: chatbotId || undefined,
                campaignId: campaignId || undefined,
                oldNodeId: nextNode.id,
                previous_response_id: previous_response_id || undefined,
                isSavePositionLead: true,
                flowStateId: flowStateId,
                currentNodeId: nextNode.id,
                edges: flow.edges,
                nodes: flow.nodes,
                accountId,
              });
            }
          },
        );
      }
    } catch (err) {
      console.error("Erro na execução async:", err);
    }
  })();
});

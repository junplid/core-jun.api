import cron from "node-cron";
import { prisma } from "../../adapters/Prisma/client";
import {
  cacheConnectionsWAOnline,
  cacheFlowsMap,
  chatbotRestartInDate,
  leadAwaiting,
  scheduleExecutionsReply,
} from "../../adapters/Baileys/Cache";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { mongo } from "../../adapters/mongo/connection";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { IPropsControler, NodeControler } from "../../libs/FlowBuilder/Control";
import momentLib from "moment-timezone";
import { decrypte } from "../../libs/encryption";
import { webSocketEmitToRoom } from "../websocket";
import { resolveHourAndMinute } from "../../utils/resolveHour:mm";

cron.schedule("*/1 * * * *", () => {
  (async () => {
    try {
      const followUps = await prisma.followUp.findMany({
        where: {
          notify_at: { lt: new Date() },
          deleted: false,
          status: "pending",
        },
        select: {
          id: true,
          body: true,
          code: true,
          accountId: true,
          FlowState: {
            select: {
              id: true,
              chatbotId: true,
              campaignId: true,
              flowId: true,
              ConnectionWA: {
                select: {
                  number: true,
                  id: true,
                  Business: { select: { name: true } },
                },
              },
              ConnectionIg: {
                select: {
                  id: true,
                  credentials: true,
                  Business: { select: { name: true } },
                },
              },
              previous_response_id: true,
              ContactsWAOnAccount: {
                select: {
                  id: true,
                  ContactsWA: { select: { completeNumber: true } },
                },
              },
              Chatbot: {
                select: {
                  businessId: true,
                  TimeToRestart: { select: { type: true, value: true } },
                },
              },
            },
          },
          flowNodeId: true,
        },
      });
      if (followUps.length) {
        followUps.forEach(async ({ FlowState, ...followup }) => {
          if (
            !FlowState.flowId ||
            !FlowState.ConnectionWA ||
            !FlowState.ContactsWAOnAccount
          ) {
            await prisma.followUp.update({
              where: { id: followup.id },
              data: { status: "failed" },
            });
            return;
          }

          await prisma.followUp.update({
            where: { id: followup.id },
            data: { status: "sent" },
          });

          let flow: any = null;
          flow = cacheFlowsMap.get(FlowState.flowId);
          if (!flow) {
            await mongo();
            const flowFetch = await ModelFlows.aggregate([
              {
                $match: {
                  accountId: followup.accountId,
                  _id: FlowState.flowId,
                },
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
            if (!flowFetch?.length) {
              await prisma.followUp.update({
                where: { id: followup.id },
                data: { status: "failed" },
              });
              return;
            }
            const { edges, nodes, businessIds } = flowFetch[0];
            flow = { edges, nodes, businessIds };
            cacheFlowsMap.set(FlowState.flowId, flow);
          }

          const pickNode = flow.nodes.find(
            (n: any) => n.id === followup.flowNodeId,
          ) as any;

          if (!pickNode) {
            await prisma.followUp.update({
              where: { id: followup.id },
              data: { status: "failed" },
            });
            return;
          }

          const nextEdgesIds = flow.edges
            .filter((f: any) => pickNode?.id === f.source)
            ?.map((nn: any) => {
              return {
                id: nn.target,
                sourceHandle: nn.sourceHandle,
              };
            });

          let nextNode: any = null;
          if (pickNode.type === "NodeAgentAI") {
            nextNode = pickNode.id;
          } else {
            nextNode = nextEdgesIds?.find((nd: any) =>
              nd.sourceHandle?.includes("follow-up"),
            );
          }
          if (nextNode) {
            let external_adapter: (any & { businessName: string }) | null =
              null;

            if (FlowState.ConnectionWA?.id) {
              let attempt = 0;
              const botOnline = new Promise<boolean>((resolve, reject) => {
                function run() {
                  if (attempt >= 5) {
                    return resolve(false);
                  } else {
                    setInterval(async () => {
                      const botWA = cacheConnectionsWAOnline.get(
                        FlowState!.ConnectionWA?.id!,
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

              const clientWA = sessionsBaileysWA.get(
                FlowState.ConnectionWA?.id!,
              )!;
              external_adapter = {
                type: "baileys",
                clientWA: clientWA,
                businessName: FlowState.ConnectionWA.Business.name,
              };
            }
            if (FlowState.ConnectionIg?.id) {
              try {
                const credential = decrypte(FlowState.ConnectionIg.credentials);
                external_adapter = {
                  type: "instagram",
                  page_token: credential.account_access_token,
                  businessName: FlowState.ConnectionIg.Business.name,
                };
              } catch (error) {
                return;
              }
            }

            if (!external_adapter) return;

            const connectionId = (FlowState.ConnectionWA?.id ||
              FlowState.ConnectionIg?.id)!;

            NodeControler({
              businessName: external_adapter.businessName,
              mode: "prod",
              flowId: FlowState.flowId,
              flowBusinessIds: flow.businessIds,
              businessId: FlowState.Chatbot!.businessId,

              ...(pickNode.type === "NodeAgentAI"
                ? {
                    type: "running",
                    action: `Follow-up executado: ${followup.body}`,
                    message: `Follow-up executado: ${followup.body}`,
                  }
                : { type: "initial", action: null }),

              external_adapter,
              connectionId,
              lead_id: FlowState.ContactsWAOnAccount!.ContactsWA.completeNumber,
              contactAccountId: FlowState.ContactsWAOnAccount.id,

              chatbotId: FlowState.chatbotId || undefined,
              campaignId: FlowState.campaignId || undefined,
              oldNodeId: nextNode.id,
              previous_response_id: FlowState.previous_response_id || undefined,
              isSavePositionLead: true,
              flowStateId: FlowState.id,
              currentNodeId: nextNode.id,
              edges: flow.edges,
              nodes: flow.nodes,
              accountId: followup.accountId,
              actions: {
                onFinish: async (vl) => {
                  const scheduleExecutionCache = scheduleExecutionsReply.get(
                    FlowState.ConnectionWA!.number +
                      "@s.whatsapp.net" +
                      FlowState.ContactsWAOnAccount!.ContactsWA.completeNumber +
                      "@s.whatsapp.net",
                  );
                  if (scheduleExecutionCache) {
                    scheduleExecutionCache.cancel();
                  }
                  console.log("TA CAINDO AQUI, finalizando fluxo");
                  await prisma.flowState.update({
                    where: { id: FlowState!.id! },
                    data: { isFinish: true, finishedAt: new Date() },
                  });
                  webSocketEmitToRoom()
                    .account(followup.accountId)
                    .dashboard.dashboard_services({
                      delta: -1,
                      hour: resolveHourAndMinute(),
                    });
                  if (
                    FlowState!.chatbotId &&
                    FlowState!.Chatbot?.TimeToRestart
                  ) {
                    const nextDate = momentLib()
                      .tz("America/Sao_Paulo")
                      .add(
                        FlowState!.Chatbot.TimeToRestart.value,
                        FlowState!.Chatbot.TimeToRestart.type,
                      )
                      .toDate();
                    chatbotRestartInDate.set(
                      `${FlowState.ConnectionWA!.number}+${
                        FlowState.ContactsWAOnAccount?.ContactsWA.completeNumber
                      }`,
                      nextDate,
                    );
                  }
                },
                onExecutedNode: async (node) => {
                  await prisma.flowState
                    .update({
                      where: { id: FlowState!.id },
                      data: { indexNode: node.id },
                    })
                    .catch((err) => console.log(err));
                },
                onEnterNode: async (node) => {
                  await prisma.flowState
                    .update({
                      where: { id: FlowState!.id },
                      data: {
                        indexNode: node.id,
                        flowId: node.flowId,
                        agentId: node.agentId || null,
                      },
                    })
                    .catch((err) => console.log(err));
                },
              },
            }).finally(() => {
              leadAwaiting.set(
                `${FlowState.ConnectionWA?.id}+${FlowState.ContactsWAOnAccount?.ContactsWA.completeNumber}`,
                false,
              );
            });
          }
        });
      }
    } catch (err) {
      console.error("Erro na execução async:", err);
    }
  })();
});

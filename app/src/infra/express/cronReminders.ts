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
import { NodeControler } from "../../libs/FlowBuilder/Control";
import momentLib from "moment-timezone";
import { NotificationApp } from "../../utils/notificationApp";
import { decrypte } from "../../libs/encryption";
import { webSocketEmitToRoom } from "../websocket";
import { resolveHourAndMinute } from "../../utils/resolveHour:mm";

cron.schedule("*/4 * * * *", () => {
  (async () => {
    try {
      const reminders = await prisma.appointmentReminders.findMany({
        where: {
          notify_at: { lt: new Date() },
          deleted: false,
          status: "pending",
          Appointment: {
            deleted: false,
            status: {
              notIn: ["canceled", "expired", "suggested", "completed"],
            },
          },
        },
        select: {
          id: true,
          moment: true,
          Appointment: {
            select: {
              businessId: true,
              startAt: true,
              title: true,
              FlowState: {
                select: {
                  id: true,
                  chatbotId: true,
                  campaignId: true,
                  previous_response_id: true,
                  Chatbot: {
                    select: {
                      TimeToRestart: { select: { type: true, value: true } },
                    },
                  },
                },
              },
              flowNodeId: true,
              accountId: true,
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
                  credentials: true,
                  id: true,
                  Business: { select: { name: true } },
                },
              },
              ContactsWAOnAccount: {
                select: {
                  id: true,
                  ContactsWA: { select: { completeNumber: true } },
                },
              },
            },
          },
        },
      });
      if (reminders.length) {
        reminders.forEach(async ({ Appointment, moment, id }) => {
          if (
            !Appointment.flowId ||
            !Appointment.FlowState ||
            !Appointment.ConnectionWA ||
            !Appointment.ContactsWAOnAccount
          ) {
            await prisma.appointmentReminders.update({
              where: { id },
              data: { status: "failed" },
            });
            return;
          }

          await prisma.appointmentReminders.update({
            where: { id },
            data: { status: "sent" },
          });
          let body_txt = "";
          const now = momentLib().tz("America/Sao_Paulo");
          const start = momentLib(Appointment.startAt).tz("America/Sao_Paulo");
          const diffMinutes = start.diff(now, "minutes");

          if (diffMinutes >= 1440) {
            const days = Math.floor(diffMinutes / 1440);
            body_txt = `Em ${days} dia${days > 1 ? "s" : ""}, às ${start.format("HH:mm")}`;
          } else if (diffMinutes >= 60) {
            const hours = Math.floor(diffMinutes / 60);
            body_txt = `Em ${hours} hora${hours > 1 ? "s" : ""}, às ${start.format("HH:mm")}`;
          } else {
            body_txt = `Em ${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""}`;
          }

          await NotificationApp({
            accountId: Appointment.accountId,
            title_txt: "Lembrete de agendamento",
            body_txt,
            tag: `appointment-${id}`,
            onFilterSocket: () => [],
            url_redirect: "/auth/appointments",
          });
          let flow: any = null;
          flow = cacheFlowsMap.get(Appointment.flowId);
          if (!flow) {
            await mongo();
            const flowFetch = await ModelFlows.aggregate([
              {
                $match: {
                  accountId: Appointment.accountId,
                  _id: Appointment.flowId,
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
              await prisma.appointmentReminders.update({
                where: { id },
                data: { status: "failed" },
              });
              return;
            }
            const { edges, nodes, businessIds } = flowFetch[0];
            flow = { edges, nodes, businessIds };
            cacheFlowsMap.set(Appointment.flowId, flow);
          }

          const orderNode = flow.nodes.find(
            (n: any) => n.id === Appointment.flowNodeId,
          ) as any;

          if (!orderNode) return;

          const nextEdgesIds = flow.edges
            .filter((f: any) => orderNode?.id === f.source)
            ?.map((nn: any) => {
              return {
                id: nn.target,
                sourceHandle: nn.sourceHandle,
              };
            });

          let nextNode: any = null;
          if (orderNode.type === "NodeAgentAI") {
            nextNode = orderNode.id;
          } else {
            nextNode = nextEdgesIds?.find((nd: any) =>
              nd.sourceHandle?.includes(moment),
            );
          }
          if (nextNode) {
            let external_adapter: (any & { businessName: string }) | null =
              null;

            if (Appointment.ConnectionWA?.id) {
              let attempt = 0;
              const botOnline = new Promise<boolean>((resolve, reject) => {
                function run() {
                  if (attempt >= 5) {
                    return resolve(false);
                  } else {
                    setInterval(async () => {
                      const botWA = cacheConnectionsWAOnline.get(
                        Appointment!.ConnectionWA?.id!,
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
                Appointment.ConnectionWA?.id!,
              )!;
              external_adapter = {
                type: "baileys",
                clientWA: clientWA,
                businessName: Appointment.ConnectionWA.Business.name,
              };
            }
            if (Appointment.ConnectionIg?.id) {
              try {
                const credential = decrypte(
                  Appointment.ConnectionIg.credentials,
                );
                external_adapter = {
                  type: "instagram",
                  page_token: credential.account_access_token,
                  businessName: Appointment.ConnectionIg.Business.name,
                };
              } catch (error) {
                return;
              }
            }

            if (!external_adapter) return;

            const connectionId = (Appointment.ConnectionWA?.id ||
              Appointment.ConnectionIg?.id)!;

            NodeControler({
              businessName: external_adapter.businessName,
              mode: "prod",
              flowId: Appointment.flowId,
              flowBusinessIds: flow.businessIds,
              businessId: Appointment.businessId,

              ...(orderNode.type === "NodeAgentAI"
                ? {
                    type: "running",
                    action: `Lembrete de agendamento automatico: ${body_txt}`,
                    message: `Lembrete de agendamento automatico: ${body_txt}`,
                  }
                : { type: "initial", action: null }),

              external_adapter,
              connectionId,
              lead_id:
                Appointment.ContactsWAOnAccount!.ContactsWA.completeNumber,
              contactAccountId: Appointment.ContactsWAOnAccount.id,

              chatbotId: Appointment.FlowState.chatbotId || undefined,
              campaignId: Appointment.FlowState.campaignId || undefined,
              oldNodeId: nextNode.id,
              previous_response_id:
                Appointment.FlowState.previous_response_id || undefined,
              isSavePositionLead: true,
              flowStateId: Appointment.FlowState.id,
              currentNodeId: nextNode.id,
              edges: flow.edges,
              nodes: flow.nodes,
              accountId: Appointment.accountId,
              actions: {
                onFinish: async (vl) => {
                  const scheduleExecutionCache = scheduleExecutionsReply.get(
                    Appointment.ConnectionWA!.number +
                      "@s.whatsapp.net" +
                      Appointment.ContactsWAOnAccount!.ContactsWA
                        .completeNumber +
                      "@s.whatsapp.net",
                  );
                  if (scheduleExecutionCache) {
                    scheduleExecutionCache.cancel();
                  }
                  console.log("TA CAINDO AQUI, finalizando fluxo");
                  await prisma.flowState.update({
                    where: { id: Appointment.FlowState!.id! },
                    data: { isFinish: true, finishedAt: new Date() },
                  });
                  webSocketEmitToRoom()
                    .account(Appointment.accountId)
                    .dashboard.dashboard_services({
                      delta: -1,
                      hour: resolveHourAndMinute(),
                    });
                  if (
                    Appointment.FlowState!.chatbotId &&
                    Appointment.FlowState!.Chatbot?.TimeToRestart
                  ) {
                    const nextDate = momentLib()
                      .add(
                        Appointment.FlowState!.Chatbot.TimeToRestart.value,
                        Appointment.FlowState!.Chatbot.TimeToRestart.type,
                      )
                      .toDate();
                    chatbotRestartInDate.set(
                      `${Appointment.ConnectionWA!.number}+${
                        Appointment.ContactsWAOnAccount?.ContactsWA
                          .completeNumber
                      }`,
                      nextDate,
                    );
                  }
                },
                onExecutedNode: async (node) => {
                  await prisma.flowState
                    .update({
                      where: { id: Appointment.FlowState!.id },
                      data: { indexNode: node.id },
                    })
                    .catch((err) => console.log(err));
                },
                onEnterNode: async (node) => {
                  await prisma.flowState
                    .update({
                      where: { id: Appointment.FlowState!.id },
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
                `${Appointment.ConnectionWA?.id}+${Appointment.ContactsWAOnAccount?.ContactsWA.completeNumber}`,
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

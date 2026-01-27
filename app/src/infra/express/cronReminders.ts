import cron from "node-cron";
import { prisma } from "../../adapters/Prisma/client";
import {
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
              ConnectionWA: { select: { number: true, id: true } },
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
            !Appointment.ConnectionWA
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
          const now = momentLib();
          const start = momentLib(Appointment.startAt);
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
            const businessInfo = await prisma.connectionWA.findFirst({
              where: { id: Appointment.ConnectionWA.id },
              select: { Business: { select: { name: true } } },
            });
            const bot = sessionsBaileysWA.get(Appointment.ConnectionWA.id);

            if (
              !businessInfo?.Business ||
              !bot ||
              !Appointment.ContactsWAOnAccount
            ) {
              await prisma.appointmentReminders.update({
                where: { id },
                data: { status: "failed" },
              });
              return;
            }

            NodeControler({
              businessName: businessInfo.Business.name,
              flowId: Appointment.flowId,
              flowBusinessIds: flow.businessIds,
              ...(orderNode.type === "NodeAgentAI"
                ? {
                    type: "running",
                    action: `Lembrete de agendamento automatico: ${body_txt}`,
                    message: `Lembrete de agendamento automatico: ${body_txt}`,
                  }
                : { type: "initial", action: null }),
              connectionWhatsId: Appointment.ConnectionWA.id,
              chatbotId: Appointment.FlowState.chatbotId || undefined,
              campaignId: Appointment.FlowState.campaignId || undefined,
              oldNodeId: nextNode.id,
              previous_response_id:
                Appointment.FlowState.previous_response_id || undefined,
              clientWA: bot,
              isSavePositionLead: true,
              flowStateId: Appointment.FlowState.id,
              contactsWAOnAccountId: Appointment.ContactsWAOnAccount.id,
              lead: {
                number:
                  Appointment.ContactsWAOnAccount!.ContactsWA.completeNumber,
              },
              currentNodeId: nextNode.id,
              edges: flow.edges,
              nodes: flow.nodes,
              numberConnection:
                Appointment.ConnectionWA.number + "@s.whatsapp.net",
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
                    data: { isFinish: true },
                  });
                  if (
                    Appointment.FlowState!.chatbotId &&
                    Appointment.FlowState!.Chatbot?.TimeToRestart
                  ) {
                    const nextDate = momentLib()
                      .tz("America/Sao_Paulo")
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
                  const indexCurrentAlreadyExist =
                    await prisma.flowState.findFirst({
                      where: {
                        connectionWAId: Appointment.ConnectionWA?.id,
                        contactsWAOnAccountId:
                          Appointment.ContactsWAOnAccount?.id,
                      },
                      select: { id: true },
                    });
                  if (!indexCurrentAlreadyExist) {
                    await prisma.flowState.create({
                      data: {
                        indexNode: node.id,
                        flowId: node.flowId,
                        connectionWAId: Appointment.ConnectionWA?.id,
                        contactsWAOnAccountId:
                          Appointment.ContactsWAOnAccount?.id,
                      },
                    });
                  } else {
                    await prisma.flowState.update({
                      where: { id: indexCurrentAlreadyExist.id },
                      data: {
                        indexNode: node.id,
                        flowId: node.flowId,
                        agentId: node.agentId || null,
                      },
                    });
                  }
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

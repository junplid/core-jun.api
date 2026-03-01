import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateAppointmentDTO_I } from "./DTO";
import { webSocketEmitToRoom } from "../../infra/websocket";
import {
  cacheConnectionsWAOnline,
  cacheFlowsMap,
  chatbotRestartInDate,
  leadAwaiting,
  scheduleExecutionsReply,
} from "../../adapters/Baileys/Cache";
import { mongo } from "../../adapters/mongo/connection";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { resolveHourAndMinute } from "../../utils/resolveHour:mm";
import { NodeControler } from "../../libs/FlowBuilder/Control";
import { decrypte } from "../../libs/encryption";

import moment from "moment";

export class UpdateAppointmentUseCase {
  constructor() {}

  async run({
    accountId,
    id,
    startAt,
    endAt,
    socketIgnore,
    ...dto
  }: UpdateAppointmentDTO_I) {
    const exist = await prisma.appointments.findFirst({
      where: { accountId, id, deleted: false },
      select: {
        status: true,
        createdBy: true,
        startAt: true,
        endAt: true,
        appointmentReminders: {
          select: { notify_at: true },
          where: {
            deleted: false,
            status: "pending",
            notify_at: { lt: new Date() },
          },
        },
      },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Compromisso não encontrado.`,
        type: "error",
      });
    }

    try {
      const nextStartAt = moment(startAt);
      const nextEndAt = nextStartAt.clone();

      if (endAt) {
        if (endAt === "10min") {
          nextEndAt.add(10, "minute");
        } else if (endAt === "30min") {
          nextEndAt.add(30, "minute");
        } else if (endAt === "1h") {
          nextEndAt.add(1, "h");
        } else if (endAt === "1h e 30min") {
          nextEndAt.add(90, "minute");
        } else if (endAt === "2h") {
          nextEndAt.add(2, "h");
        } else if (endAt === "3h") {
          nextEndAt.add(3, "h");
        } else if (endAt === "4h") {
          nextEndAt.add(4, "h");
        } else if (endAt === "5h") {
          nextEndAt.add(5, "h");
        } else if (endAt === "10h") {
          nextEndAt.add(10, "h");
        } else if (endAt === "15h") {
          nextEndAt.add(15, "h");
        } else if (endAt === "1d") {
          nextEndAt.add(1, "day");
        } else if (endAt === "2d") {
          nextEndAt.add(2, "day");
        }
      } else {
        nextEndAt.add(1, "h");
      }

      const appointment = await prisma.appointments.update({
        where: { id },
        data: {
          ...dto,
          startAt: nextStartAt.toDate(),
          endAt: nextEndAt.toDate(),
        },
        select: { startAt: true, endAt: true },
      });

      if (exist.createdBy === "bot") {
        if (exist.appointmentReminders.length) {
          const startAtOld = moment(exist.startAt);
          const listDiffMinutes = exist.appointmentReminders.map((r) =>
            startAtOld.diff(moment(r.notify_at)),
          );
          await prisma.appointmentReminders.deleteMany({
            where: { appointmentId: id },
          });
          await prisma.appointmentReminders.createMany({
            data: listDiffMinutes.map((d) => {
              const next_notify = nextStartAt.clone().subtract(d, "minute");
              return {
                appointmentId: id,
                notify_at: next_notify.toDate(),
                moment: "feito_por_agente",
              };
            }),
          });
        }

        const startAtEqual =
          moment(exist.startAt).format("DD/MM/YYYY HH:mm") ===
          nextStartAt.format("DD/MM/YYYY HH:mm");

        const isStartFlow =
          !["canceled", "expired"].includes(exist.status) &&
          nextStartAt.isAfter(moment()) &&
          !startAtEqual;

        if (isStartFlow) {
          (async () => {
            const Appointment = await prisma.appointments.findFirst({
              where: { accountId, id },
              select: {
                businessId: true,
                startAt: true,
                n_appointment: true,
                FlowState: {
                  where: { isFinish: false },
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
            });

            if (!Appointment) return;

            if (
              !Appointment.flowId ||
              !Appointment.FlowState ||
              !Appointment.ConnectionWA ||
              !Appointment.ContactsWAOnAccount
            ) {
              return;
            }

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
              if (!flowFetch?.length) return;
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
              return;
            }

            if (!nextNode) return;
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

            // informar ao usuário que e chamar controlador;
            // dto.message;

            let textAction = `O agendamento(#${Appointment.n_appointment}) foi cancelado pelo Administrador!`;
            // if (dto.message?.length) {
            //   textAction += `\nMensagem: ${dto.message}`;
            // }
            const date = moment(Appointment.startAt)
              .subtract(3, "hour")
              .format("YYYY-MM-DDTHH:mm");
            textAction = `${textAction}\n\n${JSON.stringify({ code: Appointment.n_appointment, date })}`;

            NodeControler({
              businessName: external_adapter.businessName,
              mode: "prod",
              flowId: Appointment.flowId,
              flowBusinessIds: flow.businessIds,
              businessId: Appointment.businessId,

              ...(orderNode.type === "NodeAgentAI"
                ? {
                    type: "running",
                    action: textAction,
                    message: textAction,
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
                    const nextDate = moment()
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
          })();
        }
      }

      webSocketEmitToRoom()
        .account(accountId)
        .appointments.update(
          { id, ...dto, ...appointment },
          socketIgnore ? [socketIgnore] : [],
        );

      return {
        message: "OK!",
        status: 200,
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar compromisso!`,
        type: "error",
      });
    }
  }
}

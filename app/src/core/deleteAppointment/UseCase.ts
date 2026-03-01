import { DeleteAppointmentDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
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
import { NodeControler } from "../../libs/FlowBuilder/Control";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { decrypte } from "../../libs/encryption";
import { resolveHourAndMinute } from "../../utils/resolveHour:mm";
import moment from "moment-timezone";

export class DeleteAppointmentUseCase {
  constructor() {}

  async run(dto: DeleteAppointmentDTO_I) {
    const Appointment = await prisma.appointments.findFirst({
      where: { accountId: dto.accountId, id: dto.id },
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

    if (!Appointment) {
      throw new ErrorResponse(400).toast({
        title: `Agendamento não encontrado`,
        type: "error",
      });
    }

    await prisma.appointments.update({
      where: { id: dto.id },
      data: { deleted: true },
    });

    webSocketEmitToRoom()
      .account(dto.accountId)
      .appointments.remove(
        { id: dto.id },
        dto.socketIgnore ? [dto.socketIgnore] : [],
      );

    (async () => {
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
        nextNode = nextEdgesIds?.find((nd: any) =>
          nd.sourceHandle?.includes("canceled"),
        );
      }

      if (!nextNode) return;
      let external_adapter: (any & { businessName: string }) | null = null;

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

        const clientWA = sessionsBaileysWA.get(Appointment.ConnectionWA?.id!)!;
        external_adapter = {
          type: "baileys",
          clientWA: clientWA,
          businessName: Appointment.ConnectionWA.Business.name,
        };
      }
      if (Appointment.ConnectionIg?.id) {
        try {
          const credential = decrypte(Appointment.ConnectionIg.credentials);
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
      if (dto.message?.length) {
        textAction += `\nMensagem: ${dto.message}`;
      }
      const date = moment(Appointment.startAt)
        .tz("America/Sao_Paulo")
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
        lead_id: Appointment.ContactsWAOnAccount!.ContactsWA.completeNumber,
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
                Appointment.ContactsWAOnAccount!.ContactsWA.completeNumber +
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
                .add(
                  Appointment.FlowState!.Chatbot.TimeToRestart.value,
                  Appointment.FlowState!.Chatbot.TimeToRestart.type,
                )
                .toDate();

              chatbotRestartInDate.set(
                `${Appointment.ConnectionWA!.number}+${
                  Appointment.ContactsWAOnAccount?.ContactsWA.completeNumber
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
    return {
      message: "OK!",
      status: 200,
    };
  }
}

import { sessionsBaileysWA } from "../../adapters/Baileys";
import {
  cacheConnectionsWAOnline,
  cacheFlowsMap,
  leadAwaiting,
} from "../../adapters/Baileys/Cache";
import { mongo } from "../../adapters/mongo/connection";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { prisma } from "../../adapters/Prisma/client";
import { socketIo } from "../../infra/express";
import { webSocketEmitToRoom } from "../../infra/websocket";
import { cacheAccountSocket } from "../../infra/websocket/cache";
import { decrypte } from "../../libs/encryption";
import { IPropsControler, NodeControler } from "../../libs/FlowBuilder/Control";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { resolveHourAndMinute } from "../../utils/resolveHour:mm";
import { ResolveTicketDTO_I } from "./DTO";

export class ResolveTicketUseCase {
  constructor() {}

  async run({ ...dto }: ResolveTicketDTO_I) {
    const exist = await prisma.tickets.findFirst({
      where: {
        id: dto.id,
        ...(dto.accountId && { accountId: dto.accountId }),
        status: "OPEN",
      },
      select: { id: true },
    });

    if (!exist) {
      throw new ErrorResponse(400).container(
        "Não foi possivel encontrar o ticket.",
      );
    }

    try {
      const { InboxDepartment, ContactsWAOnAccount, updateAt, ...rest } =
        await prisma.tickets.update({
          where: { id: dto.id },
          data: { status: "RESOLVED" },
          select: {
            id: true,
            InboxDepartment: {
              select: { name: true, id: true, businessId: true },
            },
            ContactsWAOnAccount: {
              select: {
                id: true,
                name: true,
                ContactsWA: { select: { completeNumber: true } },
              },
            },
            updateAt: true,
            GoBackFlowState: {
              select: { flowId: true, indexNode: true, id: true },
            },
            accountId: true,
            ConnectionWA: {
              select: {
                id: true,
                number: true,
                Business: { select: { name: true } },
              },
            },
            ConnectionIg: {
              select: {
                id: true,
                credentials: true,
                page_id: true,
                Business: { select: { name: true } },
              },
            },
          },
        });

      if (dto.accountId) {
        const { departments, player_department } =
          webSocketEmitToRoom().account(dto.accountId);

        departments.math_open_ticket_count(
          {
            departmentId: InboxDepartment.id,
            n: -1,
          },
          [],
        );

        player_department(InboxDepartment.id).resolve_ticket_list(
          {
            forceOpen: false,
            departmentId: InboxDepartment.id,
            notifyMsc: false,
            name: ContactsWAOnAccount.name,
            lastInteractionDate: updateAt,
            id: dto.id,
            userId: undefined,
          },
          [],
        );

        if (dto.orderId) {
          const order = await prisma.orders.findFirst({
            where: {
              id: dto.orderId,
              accountId: dto.accountId,
            },
            select: { status: true },
          });
          if (order?.status) {
            webSocketEmitToRoom().account(dto.accountId).orders.remove_ticket(
              {
                status: order.status,
                ticketId: dto.id,
                orderId: dto.orderId,
              },
              [],
            );
          }
        }
      }

      if (!rest.GoBackFlowState || !rest.GoBackFlowState.flowId) {
        return { message: "OK!", status: 201 };
      }

      let external_adapter: (any & { businessName: string }) | null = null;

      if (rest.ConnectionWA?.id) {
        let attempt = 0;
        const botOnline = new Promise<boolean>((resolve, reject) => {
          function run() {
            if (attempt >= 5) {
              return resolve(false);
            } else {
              setInterval(async () => {
                const botWA = cacheConnectionsWAOnline.get(
                  rest.ConnectionWA?.id!,
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
          throw new ErrorResponse(400).container(
            "Não foi possivel encontrar a conexão conectada.",
          );
        }

        const clientWA = sessionsBaileysWA.get(rest.ConnectionWA?.id!)!;
        external_adapter = {
          type: "baileys",
          clientWA: clientWA,
          businessName: rest.ConnectionWA.Business.name,
        };
      }
      if (rest.ConnectionIg?.id) {
        try {
          const credential = decrypte(rest.ConnectionIg.credentials);
          external_adapter = {
            type: "instagram",
            page_token: credential.account_access_token,
            businessName: rest.ConnectionIg.Business.name,
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

      let flow = cacheFlowsMap.get(rest.GoBackFlowState.flowId);
      if (!flow) {
        await mongo();
        const findFlow = await ModelFlows.aggregate([
          {
            $match: {
              accountId: rest.accountId,
              _id: rest.GoBackFlowState.flowId,
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
        const { nodes, edges, businessIds } = findFlow[0] || {};
        flow = { nodes, edges, businessIds };
      }

      if (!flow) {
        throw new ErrorResponse(400).container(
          "Não foi possivel encontrar o fluxo.",
        );
      }

      const orderNode = flow.nodes.find(
        (n: any) => n.id === rest.GoBackFlowState!.indexNode,
      ) as any;

      const connectionId = (rest.ConnectionWA?.id || rest.ConnectionIg?.id)!;

      NodeControler({
        mode: "prod",
        external_adapter: external_adapter,
        connectionId,
        businessId: InboxDepartment.businessId,
        lead_id: ContactsWAOnAccount.ContactsWA.completeNumber,
        businessName: external_adapter.businessName,
        oldNodeId: rest.GoBackFlowState.indexNode || "0",
        accountId: rest.accountId,
        flowId: rest.GoBackFlowState.flowId,
        ...(orderNode.type === "NodeAgentAI"
          ? {
              type: "running",
              action: `O atendimento foi resolvido [ticket-${dto.id}]`,
              message: `O atendimento foi resolvido [ticket-${dto.id}]`,
            }
          : {
              type: "initial",
              action: null,
            }),
        contactAccountId: ContactsWAOnAccount.id,
        flowStateId: rest.GoBackFlowState.id,
        nodes: flow.nodes,
        edges: flow.edges,
        currentNodeId: rest.GoBackFlowState.indexNode || "0",
        actions: {
          onFinish: async (vl) => {
            if (rest.GoBackFlowState) {
              await prisma.flowState.update({
                where: { id: rest.GoBackFlowState.id },
                data: { isFinish: true, finishedAt: new Date() },
              });
              webSocketEmitToRoom()
                .account(rest.accountId)
                .dashboard.dashboard_services({
                  delta: -1,
                  hour: resolveHourAndMinute(),
                });
            }
          },
          onExecutedNode: async (node) => {
            if (rest.GoBackFlowState?.id) {
              try {
                await prisma.flowState
                  .update({
                    where: { id: rest.GoBackFlowState?.id },
                    data: { indexNode: node.id },
                  })
                  .catch((err) => console.log(err));
              } catch (error) {
                console.log("Error ao atualizar flowState!");
              }
            }
          },
          onEnterNode: async (node) => {
            if (rest.GoBackFlowState) {
              await prisma.flowState.update({
                where: { id: rest.GoBackFlowState.id },
                data: { indexNode: node.id },
              });
            }
          },
        },
      }).finally(() => {
        leadAwaiting.set(
          `${connectionId}+${ContactsWAOnAccount.ContactsWA.completeNumber}`,
          false,
        );
      });

      return { message: "OK!", status: 201 };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: "Não foi possivel puxar ticket.",
        type: "error",
      });
    }
  }
}

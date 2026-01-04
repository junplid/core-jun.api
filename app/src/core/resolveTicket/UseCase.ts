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
import { cacheAccountSocket } from "../../infra/websocket/cache";
import { NodeControler } from "../../libs/FlowBuilder/Control";
import { ErrorResponse } from "../../utils/ErrorResponse";
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
        "Não foi possivel encontrar o ticket."
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
            connectionWAId: true,
            accountId: true,
            ConnectionWA: {
              select: { id: true, number: true },
            },
          },
        });

      if (dto.accountId) {
        const isonline = cacheAccountSocket.get(dto.accountId)?.listSocket
          .length;

        cacheAccountSocket
          .get(dto.accountId)
          ?.listSocket?.forEach(async (sockId) => {
            socketIo.to(sockId.id).emit(`inbox`, {
              accountId: dto.accountId,
              departmentId: InboxDepartment.id,
              departmentName: InboxDepartment.name,
              status: "RESOLVED",
              id: dto.id,
            });
          });
        if (isonline) {
          socketIo
            .of(`/business-${InboxDepartment.businessId}/inbox`)
            .emit("list", {
              status: "RESOLVED",
              forceOpen: false,
              departmentId: InboxDepartment.id,
              notifyMsc: false,
              name: ContactsWAOnAccount.name,
              lastInteractionDate: updateAt,
              id: dto.id,
              userId: undefined, // caso seja enviado para um usuário.
            });
        }

        if (dto.orderId) {
          const order = await prisma.orders.findFirst({
            where: {
              id: dto.orderId,
              accountId: dto.accountId,
            },
            select: { status: true },
          });
          if (order?.status) {
            cacheAccountSocket
              .get(dto.accountId)
              ?.listSocket?.forEach(async (sockId) => {
                socketIo.to(sockId.id).emit(`order:ticket:remove`, {
                  accountId: dto.accountId,
                  status: order.status,
                  ticketId: dto.id,
                  orderId: dto.orderId,
                });
              });
          }
        }
      }

      if (!rest.GoBackFlowState || !rest.GoBackFlowState.flowId) {
        return { message: "OK!", status: 201 };
      }

      let attempt = 0;
      const botOnline = new Promise<boolean>((resolve, reject) => {
        function run() {
          if (attempt >= 5) {
            return resolve(false);
          } else {
            setInterval(async () => {
              const botWA = cacheConnectionsWAOnline.get(rest!.connectionWAId);
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
          "Não foi possivel encontrar a conexão conectada."
        );
      }

      const clientWA = sessionsBaileysWA.get(rest.connectionWAId)!;

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
          "Não foi possivel encontrar o fluxo."
        );
      }

      NodeControler({
        clientWA,
        businessName: InboxDepartment.name,
        connectionWhatsId: rest.connectionWAId,
        action: null,
        lead: { number: ContactsWAOnAccount.ContactsWA.completeNumber },
        oldNodeId: rest.GoBackFlowState.indexNode || "0",
        accountId: rest.accountId,
        flowId: rest.GoBackFlowState.flowId,
        numberConnection: rest.ConnectionWA.number! + "@s.whatsapp.net",
        type: "initial",
        contactsWAOnAccountId: ContactsWAOnAccount.id,
        flowStateId: rest.GoBackFlowState.id,
        nodes: flow.nodes,
        edges: flow.edges,
        currentNodeId: rest.GoBackFlowState.indexNode || "0",
        actions: {
          onFinish: async (vl) => {
            if (rest.GoBackFlowState) {
              await prisma.flowState.update({
                where: { id: rest.GoBackFlowState.id },
                data: { isFinish: true },
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
            const indexCurrentAlreadyExist = await prisma.flowState.findFirst({
              where: {
                connectionWAId: rest.connectionWAId,
                contactsWAOnAccountId: ContactsWAOnAccount.id,
              },
              select: { id: true },
            });
            if (!indexCurrentAlreadyExist) {
              await prisma.flowState.create({
                data: {
                  indexNode: node.id,
                  connectionWAId: rest.connectionWAId,
                  contactsWAOnAccountId: ContactsWAOnAccount.id,
                },
              });
            } else {
              await prisma.flowState.update({
                where: { id: indexCurrentAlreadyExist.id },
                data: { indexNode: node.id },
              });
            }
          },
        },
      }).finally(() => {
        leadAwaiting.set(
          `${rest.connectionWAId}+${ContactsWAOnAccount.ContactsWA.completeNumber}`,
          false
        );
      });

      return { message: "OK!", status: 201 };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).toast({
        title: "Não foi possivel puxar ticket.",
        type: "error",
      });
    }
  }
}

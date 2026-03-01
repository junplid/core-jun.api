import {
  ensureFile,
  ensureFileSync,
  readFile,
  writeFile,
  writeFileSync,
} from "fs-extra";
import { resolve } from "path";
import { Server } from "socket.io";
import {
  Baileys,
  CacheSessionsBaileysWA,
  killConnectionWA,
  sessionsBaileysWA,
} from "../../adapters/Baileys";
import { cacheAccountSocket } from "./cache";
import {
  cacheConnectionsWAOnline,
  cacheFlowsMap,
  cacheTestAgentAI,
  chatbotRestartInDate,
  leadAwaiting,
  scheduleExecutionsReply,
} from "../../adapters/Baileys/Cache";
import { prisma } from "../../adapters/Prisma/client";
import OpenAI from "openai";
import { TypeStatusMessage, TypeStatusOrder } from "@prisma/client";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { mongo } from "../../adapters/mongo/connection";
import { NodeControler } from "../../libs/FlowBuilder/Control";
import moment from "moment-timezone";
import { metaAccountsCache } from "../../services/meta/cache";
import { decrypte } from "../../libs/encryption";
import { getSocketIo } from "../express";
import { resolveHourAndMinute } from "../../utils/resolveHour:mm";
import { cacheTestAgentTemplate } from "../../libs/FlowBuilder/cache";

interface PropsCreateSessionWA_I {
  connectionWhatsId: number;
  number?: string;
}

interface VectorStoreTest {
  apiKey: string;
  vectorStoreId: string;
  tokenTest: string;
  files: { localId: number; openFileId: string }[];
}

let pathFilesTest = "";
if (process.env.NODE_ENV === "production") {
  pathFilesTest = resolve(__dirname, `../bin/files-test.json`);
} else {
  pathFilesTest = resolve(__dirname, `../../../bin/files-test.json`);
}
ensureFileSync(pathFilesTest);

export const WebSocketIo = (io: Server) => {
  io.on("connection", async (socket) => {
    const { auth } = socket.handshake;

    if (auth.accountId) {
      socket.join(`account:${auth.accountId}`);
    }
    if (auth.rootId) {
      socket.join(`root:${auth.rootId}`);
    }

    if (!auth.accountId && !auth.rootId) return socket.disconnect(true);

    socket.on("set-focused", (data: { focus: string | null }) => {
      if (auth.accountId) {
        const stateUser = cacheAccountSocket.get(auth.accountId);
        if (stateUser) {
          const nextState = stateUser.listSocket.map((sk) => {
            if (sk.id === socket.id) sk.focused = data.focus;
            return sk;
          });
          cacheAccountSocket.set(auth.accountId, {
            ...stateUser,
            listSocket: nextState,
          });
        }
      }
    });

    socket.on("create-session", async (data: PropsCreateSessionWA_I) => {
      const connectionDB = await prisma.connectionWA.findFirst({
        where: {
          id: data.connectionWhatsId,
          Business: { accountId: auth.accountId },
          interrupted: false,
        },
        select: { type: true, name: true },
      });
      if (!connectionDB) {
        socket.emit("error-connection-wa", {
          message: "Conexão não encontrada ou você não está autorizado!",
          ...data,
        });
        return;
      }
      await Baileys({
        accountId: auth.accountId,
        connectionWhatsId: data.connectionWhatsId,
        socket: socket,
        number: data.number,
        onConnection: async (connection) => {
          socket.emit(
            `status-session-${data.connectionWhatsId}`,
            connection ?? "close",
          );
          socket.emit(`status_connection`, {
            connectionId: data.connectionWhatsId,
            connection: "sync",
          });
          setTimeout(() => {
            socket.emit(`status_connection`, {
              connectionId: data.connectionWhatsId,
              connection: connection ?? "close",
            });
          }, 4500);

          let path = "";
          if (process.env?.NODE_ENV === "production") {
            path = resolve(__dirname, `../bin/connections.json`);
          } else {
            path = resolve(__dirname, `../../../bin/connections.json`);
          }
          await ensureFile(path);
          readFile(path, (err, file) => {
            if (err) {
              return console.log(err);
            }
            const listConnections: CacheSessionsBaileysWA[] = JSON.parse(
              file.toString(),
            );

            const alreadyExists = listConnections.some(
              ({ connectionWhatsId }) =>
                connectionWhatsId === data.connectionWhatsId,
            );

            if (!alreadyExists) {
              listConnections.push({
                accountId: auth.accountId,
                connectionWhatsId: data.connectionWhatsId,
              });
              writeFileSync(path, JSON.stringify(listConnections));
            }
          });
        },
      });
    });

    socket.on("revoke-session", async (data: PropsCreateSessionWA_I) => {
      const isconnected = cacheConnectionsWAOnline.get(data.connectionWhatsId);
      if (isconnected) return;
      const connectionDB = await prisma.connectionWA.findFirst({
        where: {
          id: data.connectionWhatsId,
          Business: { accountId: auth.accountId },
          interrupted: false,
        },
        select: { type: true, name: true },
      });
      if (!connectionDB) {
        socket.emit("error-connection-wa", {
          message: "Conexão não encontrada ou você não está autorizado!",
          ...data,
        });
        return;
      }
      await killConnectionWA(data.connectionWhatsId, auth.accountId);
    });

    socket.on("agent-ai:clear-tokenTest", async (tokenTest: string) => {
      cacheTestAgentAI.delete(tokenTest);
      const vsTest: VectorStoreTest[] = JSON.parse(
        (await readFile(resolve(pathFilesTest), "utf-8")) || "[]",
      );

      const existingTokenTest = vsTest.find((v) => v.tokenTest === tokenTest);
      if (existingTokenTest) {
        const openai = new OpenAI({ apiKey: existingTokenTest.apiKey });
        const filesVs = await openai.vectorStores.files.list(
          existingTokenTest.vectorStoreId,
        );
        await openai.vectorStores.delete(existingTokenTest.vectorStoreId);
        for (const file of filesVs.data) {
          await openai.files.delete(file.id);
        }
        const updatedVsTest = vsTest.filter((v) => v.tokenTest !== tokenTest);
        await writeFile(
          resolve(pathFilesTest),
          JSON.stringify(updatedVsTest, null, 2),
        );
      }
    });

    socket.on("agent-template:clear-tokenTest", async (tokenTest: string) => {
      cacheTestAgentTemplate.del(tokenTest);
    });

    socket.on("disconnect", async (reason) => {
      socket.leave(`account:${auth.accountId}`);
      socket.leave(`root:${auth.rootId}`);

      // const stateUser = cacheAccountSocket.get(auth.accountId);
      // if (stateUser) {
      //   stateUser.listSocket = stateUser.listSocket.filter(
      //     (ids) => ids.id !== socket.id,
      //   );
      //   if (stateUser.listSocket.length === 0) {
      //     cacheAccountSocket.delete(auth.accountId);
      //   }
      // }
    });

    socket.on(
      "order:update_rank",
      async (props: {
        rank: number;
        orderId: number;
        nextIndex: number;
        status: TypeStatusOrder;
      }) => {
        socket
          .to(`account:${auth.accountId}:orders`)
          .emit("update_rank", props);
        await prisma.orders.update({
          where: { id: props.orderId, accountId: auth.accountId },
          data: { rank: props.rank },
        });
      },
    );

    socket.on(
      "order:update_status",
      async (props: {
        rank: number;
        orderId: number;
        nextIndex: number;
        sourceStatus: TypeStatusOrder;
        nextStatus: TypeStatusOrder;
      }) => {
        socket
          .to(`account:${auth.accountId}:orders`)
          .emit("update_status", props);
        await prisma.orders.update({
          where: { id: props.orderId, accountId: auth.accountId },
          data: { rank: props.rank, status: props.nextStatus },
        });

        const order = await prisma.orders.findFirst({
          where: { accountId: auth.accountId, id: props.orderId },
          select: {
            id: true,
            flowNodeId: true,
            flowStateId: true,
            businessId: true,
            flowId: true,
            n_order: true,
            ContactsWAOnAccount: {
              select: {
                id: true,
                ContactsWA: { select: { completeNumber: true } },
              },
            },
          },
        });

        if (!order) {
          // tratar error aqui. não encontrou o pedido
          console.log("caiu aqui no error 1");
          console.log({ order });
          return;
        }

        if (!order.flowId || !order.flowStateId) return;

        let flow: any = null;
        flow = cacheFlowsMap.get(order.flowId);
        if (!flow) {
          await mongo();
          const flowFetch = await ModelFlows.aggregate([
            {
              $match: {
                accountId: auth.accountId,
                _id: order.flowId,
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
          if (!flowFetch?.length) return console.log(`Flow not found. 3`);
          const { edges, nodes, businessIds } = flowFetch[0];
          flow = { edges, nodes, businessIds };
          cacheFlowsMap.set(order.flowId, flow);
        }

        const orderNode = flow.nodes.find(
          (n: any) => n.id === order.flowNodeId,
        ) as any;

        const nextEdgesIds = flow.edges
          .filter((f: any) => orderNode?.id === f.source)
          ?.map((nn: any) => {
            return {
              id: nn.target,
              sourceHandle: nn.sourceHandle,
            };
          });

        // se o order foi criado por um node de agente então é isso.
        let nextNodeId: any = null;
        if (orderNode.type === "NodeAgentAI") {
          nextNodeId = orderNode.id;
        } else {
          nextNodeId = nextEdgesIds?.find((nd: any) =>
            nd.sourceHandle?.includes(props.nextStatus),
          );
        }
        if (nextNodeId) {
          const flowState = await prisma.flowState.findFirst({
            where: { id: order.flowStateId },
            select: {
              chatbotId: true,
              campaignId: true,
              previous_response_id: true,
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
              Chatbot: {
                select: {
                  TimeToRestart: { select: { type: true, value: true } },
                },
              },
            },
          });
          if (!flowState) return;

          let external_adapter: (any & { businessName: string }) | null = null;

          if (flowState.ConnectionWA?.id) {
            let attempt = 0;
            const botOnline = new Promise<boolean>((resolve, reject) => {
              function run() {
                if (attempt >= 5) {
                  return resolve(false);
                } else {
                  setInterval(async () => {
                    const botWA = cacheConnectionsWAOnline.get(
                      flowState!.ConnectionWA?.id!,
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
              flowState.ConnectionWA?.id!,
            )!;
            external_adapter = {
              type: "baileys",
              clientWA: clientWA,
              businessName: flowState.ConnectionWA.Business.name,
            };
          }
          if (flowState.ConnectionIg?.id) {
            try {
              const credential = decrypte(flowState.ConnectionIg.credentials);
              external_adapter = {
                type: "instagram",
                page_token: credential.account_access_token,
                businessName: flowState.ConnectionIg.Business.name,
              };
            } catch (error) {
              return;
            }
          }

          if (!external_adapter) return;

          const connectionId = (flowState.ConnectionWA?.id ||
            flowState.ConnectionIg?.id)!;

          if (
            !flowState ||
            !order.ContactsWAOnAccount ||
            !flowState.ConnectionWA
          ) {
            console.log("caiu aqui no error 2");
            console.log([
              !flowState,
              !order.ContactsWAOnAccount,
              !flowState?.ConnectionWA,
            ]);
            // tratar error aqui. não encontrou o pedido
            return;
          }

          await NodeControler({
            businessName: external_adapter.businessName,
            mode: "prod",
            flowId: order.flowId,
            businessId: order.businessId,
            flowBusinessIds: flow.businessIds,
            ...(orderNode.type === "NodeAgentAI"
              ? {
                  type: "running",
                  action: `O pedido ${order}(codigo do pedido) ${order.id}(ID) mudou para a coluna ${props.nextStatus}`,
                  message: `O pedido ${order}(codigo do pedido) ${order.id}(ID) mudou para a coluna ${props.nextStatus}`,
                }
              : {
                  type: "initial",
                  action: null,
                }),

            external_adapter,
            connectionId,
            lead_id: order.ContactsWAOnAccount!.ContactsWA.completeNumber,
            contactAccountId: order.ContactsWAOnAccount.id,

            chatbotId: flowState.chatbotId || undefined,
            campaignId: flowState.campaignId || undefined,
            oldNodeId: nextNodeId.id,
            previous_response_id: flowState.previous_response_id || undefined,
            isSavePositionLead: true,
            flowStateId: order.flowStateId,
            currentNodeId: nextNodeId.id,
            edges: flow.edges,
            nodes: flow.nodes,
            accountId: auth.accountId,
            actions: {
              onFinish: async (vl) => {
                const scheduleExecutionCache = scheduleExecutionsReply.get(
                  flowState.ConnectionWA!.number +
                    "@s.whatsapp.net" +
                    order.ContactsWAOnAccount!.ContactsWA.completeNumber +
                    "@s.whatsapp.net",
                );
                if (scheduleExecutionCache) {
                  scheduleExecutionCache.cancel();
                }
                console.log("TA CAINDO AQUI, finalizando fluxo");
                await prisma.flowState.update({
                  where: { id: order.flowStateId! },
                  data: { isFinish: true, finishedAt: new Date() },
                });
                webSocketEmitToRoom()
                  .account(auth.accountId)
                  .dashboard.dashboard_services({
                    delta: -1,
                    hour: resolveHourAndMinute(),
                  });
                if (flowState.chatbotId && flowState.Chatbot?.TimeToRestart) {
                  const nextDate = moment()
                    .add(
                      flowState.Chatbot.TimeToRestart.value,
                      flowState.Chatbot.TimeToRestart.type,
                    )
                    .toDate();
                  chatbotRestartInDate.set(
                    `${flowState.ConnectionWA!.number}+${
                      order.ContactsWAOnAccount?.ContactsWA.completeNumber
                    }`,
                    nextDate,
                  );
                }
              },
              onExecutedNode: async (node) => {
                await prisma.flowState
                  .update({
                    where: { id: order.flowStateId! },
                    data: { indexNode: node.id },
                  })
                  .catch((err) => console.log(err));
              },
              onEnterNode: async (node) => {
                await prisma.flowState
                  .update({
                    where: { id: order.flowStateId! },
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
              `${connectionId}+${
                order.ContactsWAOnAccount!.ContactsWA.completeNumber
              }`,
              false,
            );
          });
        }
      },
    );

    socket.on("join_modal:create_agentai", (modal_id: string) => {
      socket.join(modal_id);
      // const paginasNoCache = metaAccountsCache.get(modal_id);
      // if (paginasNoCache) {
      //   io.to(modal_id).emit("facebook_pages_list", paginasNoCache);
      //   metaAccountsCache.del(modal_id);
      // }
    });

    socket.on("exit_modal:create_agentai", (modal_id: string) => {
      socket.leave(modal_id);
      metaAccountsCache.del(modal_id);
      // const paginasNoCache = metaAccountsCache.get(modal_id);
      // if (paginasNoCache) {
      //   io.to(modal_id).emit("facebook_pages_list", paginasNoCache);
      //   metaAccountsCache.del(modal_id);
      // }
    });

    socket.on("join_orders", () => {
      socket.join(`account:${auth.accountId}:orders`);
    });

    socket.on("leave_orders", () => {
      socket.leave(`account:${auth.accountId}:orders`);
    });

    socket.on("join_ticket", (args: { id?: number }) => {
      if (!args.id) {
        socket.leave(`account:${auth.accountId}:ticket:${args.id}`);
        return;
      }
      socket.join(`account:${auth.accountId}:ticket:${args.id}`);
    });

    socket.on("leave_ticket", (args: { id?: number }) => {
      if (!args.id) {
        console.log("NÃO TINHA TICKET_ID PARA SAIR");
        return;
      }
      socket.leave(`account:${auth.accountId}:ticket:${args.id}`);
    });

    socket.on("join_departments", () => {
      socket.join(`account:${auth.accountId}:departments`);
    });

    socket.on("leave_departments", () => {
      socket.leave(`account:${auth.accountId}:departments`);
    });

    socket.on("join_player_department", (args: { id: number }) => {
      socket.join(`account:${auth.accountId}:department:player:${args.id}`);
    });

    socket.on("leave_player_department", (args: { id: number }) => {
      socket.leave(`account:${auth.accountId}:department:player:${args.id}`);
    });

    socket.on("join_dashboard", () => {
      socket.join(`account:${auth.accountId}:dashboard`);
    });

    socket.on("leave_dashboard", () => {
      socket.leave(`account:${auth.accountId}:dashboard`);
    });

    socket.on("join_connections", () => {
      socket.join(`account:${auth.accountId}:connections`);
    });

    socket.on("leave_connections", () => {
      socket.leave(`account:${auth.accountId}:connections`);
    });

    socket.on("join_appointments", () => {
      socket.join(`account:${auth.accountId}:appointments`);
    });

    socket.on("leave_appointments", () => {
      socket.leave(`account:${auth.accountId}:appointments`);
    });

    // atualizar status do evento.
  });
};

export const webSocketEmitToRoom = () => {
  const io = getSocketIo();

  return {
    account: (accountId: number) => {
      let to = `account:${accountId}`;
      return {
        emit: (emit: string, args: any, ignore: string[]) => {
          io.to(to).except(ignore).emit(emit, args);
        },
        connections: {
          status_connection: (args: any, ignore: string[]) => {
            to = `${to}:connections`;
            io.to(to).except(ignore).emit("status_connection", args);
          },
        },
        user_updated: (args: any, ignore: string[]) => {
          io.to(to).except(ignore).emit("user_updated", args);
        },
        dashboard: {
          dashboard_services: (args: { delta: number; hour: string }) => {
            to = `${to}:dashboard`;
            io.to(to).emit("dashboard_services", args);
          },
        },
        appointments: {
          remove: (args: any, ignore: string[]) => {
            to = `${to}:appointments`;
            return io.to(to).except(ignore).emit("remove_appointment", args);
          },
          new: (args: any, ignore: string[]) => {
            to = `${to}:appointments`;
            return io.to(to).except(ignore).emit("new_appointment", args);
          },
          update: (args: any, ignore: string[]) => {
            to = `${to}:appointments`;
            return io.to(to).except(ignore).emit("update_appointment", args);
          },
        },
        orders: {
          new_order: (args: any, ignore: string[]) => {
            to = `${to}:orders`;
            return io.to(to).except(ignore).emit("new_order", args);
          },
          update_order: (args: any, ignore: string[]) => {
            to = `${to}:orders`;
            return io.to(to).except(ignore).emit("update_order", args);
          },
          new_ticket: (args: any, ignore: string[]) => {
            to = `${to}:orders`;
            return io.to(to).except(ignore).emit("new_ticket", args);
          },
          update_status: (args: any, ignore: string[]) => {
            to = `${to}:orders`;
            return io.to(to).except(ignore).emit("update_status", args);
          },
          update_rank: (args: any, ignore: string[]) => {
            to = `${to}:orders`;
            return io.to(to).except(ignore).emit("update_rank", args);
          },
          open_ticket: (args: any, ignore: string[]) => {
            to = `${to}:orders`;
            return io.to(to).except(ignore).emit("open_ticket", args);
          },
          return_ticket: (args: any, ignore: string[]) => {
            to = `${to}:orders`;
            return io.to(to).except(ignore).emit("return_ticket", args);
          },
          remove_ticket: (args: any, ignore: string[]) => {
            to = `${to}:orders`;
            return io.to(to).except(ignore).emit("remove_ticket", args);
          },
        },
        ticket_chat: (id: number) => {
          return {
            message_eco: (args: any, ignore: string[]) => {
              to = `${to}:ticket:${id}`;
              return io.to(to).except(ignore).emit("message_eco", args);
            },
            message: (args: any, ignore: string[]) => {
              to = `${to}:ticket:${id}`;
              return io.to(to).except(ignore).emit("message", args);
            },
          };
        },
        departments: {
          math_open_ticket_count: (args: any, ignore: string[]) => {
            to = `${to}:departments`;
            return io
              .to(to)
              .except(ignore)
              .emit("math_open_ticket_count", args);
          },
          math_new_ticket_count: (args: any, ignore: string[]) => {
            to = `${to}:departments`;
            return io.to(to).except(ignore).emit("math_new_ticket_count", args);
          },
        },
        player_department: (id: number) => {
          to = `${to}:department:player:${id}`;
          return {
            return_ticket_list: (args: any, ignore: string[]) => {
              return io.to(to).except(ignore).emit("return_ticket_list", args);
            },
            resolve_ticket_list: (args: any, ignore: string[]) => {
              return io.to(to).except(ignore).emit("resolve_ticket_list", args);
            },
            new_ticket_list: (args: any, ignore: string[]) => {
              return io.to(to).except(ignore).emit("new_ticket_list", args);
            },
            open_ticket_list: (args: any, ignore: string[]) => {
              return io.to(to).except(ignore).emit("open_ticket_list", args);
            },
            message_ticket_list: (
              args: {
                ticketId: number;
                by: "contact" | "user" | "system";
                type: "file" | "text" | "image" | "video" | "audio";
                status: TypeStatusMessage;
                createAt: Date;
                text?: string;
              },
              ignore: string[],
            ) => {
              return io.to(to).except(ignore).emit("message_ticket_list", args);
            },
          };
        },
      };
    },
  };
};

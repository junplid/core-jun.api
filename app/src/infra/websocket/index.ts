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
import { cacheAccountSocket, cacheRootSocket } from "./cache";
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
import { TypeStatusOrder } from "@prisma/client";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { mongo } from "../../adapters/mongo/connection";
import { NodeControler } from "../../libs/FlowBuilder/Control";
import moment from "moment-timezone";

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
      const stateUser = cacheAccountSocket.get(auth.accountId);
      if (!stateUser) {
        cacheAccountSocket.set(auth.accountId, {
          listSocket: [socket.id],
        });
      } else {
        stateUser.listSocket.push(socket.id);
      }
    }
    if (auth.rootId) {
      cacheRootSocket.push(socket.id);
    }

    if (!auth.accountId && !auth.rootId) return socket.disconnect(true);

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
            connection ?? "close"
          );
          socket.emit(`status-connection`, {
            connectionId: data.connectionWhatsId,
            connection: "sync",
          });
          setTimeout(() => {
            socket.emit(`status-connection`, {
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
              file.toString()
            );

            const alreadyExists = listConnections.some(
              ({ connectionWhatsId }) =>
                connectionWhatsId === data.connectionWhatsId
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
        (await readFile(resolve(pathFilesTest), "utf-8")) || "[]"
      );

      const existingTokenTest = vsTest.find((v) => v.tokenTest === tokenTest);
      if (existingTokenTest) {
        const openai = new OpenAI({ apiKey: existingTokenTest.apiKey });
        const filesVs = await openai.vectorStores.files.list(
          existingTokenTest.vectorStoreId
        );
        await openai.vectorStores.delete(existingTokenTest.vectorStoreId);
        for (const file of filesVs.data) {
          await openai.files.delete(file.id);
        }
        const updatedVsTest = vsTest.filter((v) => v.tokenTest !== tokenTest);
        await writeFile(
          resolve(pathFilesTest),
          JSON.stringify(updatedVsTest, null, 2)
        );
      }
    });

    socket.on("disconnect", async (reason) => {
      const stateUser = cacheAccountSocket.get(auth.accountId);
      if (stateUser) {
        stateUser.listSocket = stateUser.listSocket.filter(
          (ids) => ids !== socket.id
        );
        if (stateUser.listSocket.length === 0) {
          cacheAccountSocket.delete(auth.accountId);
        }
      }
    });

    socket.on(
      "order:update-rank",
      async (props: {
        sourceIndex: number;
        nextIndex: number;
        rank: number;
        status: TypeStatusOrder;
        orderId: number;
      }) => {
        cacheAccountSocket
          .get(auth.accountId)
          ?.listSocket?.forEach((sockId) => {
            if (sockId !== socket.id) {
              socket.to(sockId).emit(`order:update-rank`, {
                ...props,
                accountId: auth.accountId,
              });
            }
          });

        await prisma.orders.update({
          where: { id: props.orderId, accountId: auth.accountId },
          data: { rank: props.rank },
        });
      }
    );

    socket.on(
      "order:update-status",
      async (props: {
        sourceIndex: number;
        nextIndex: number;
        rank: number;
        sourceStatus: TypeStatusOrder;
        nextStatus: TypeStatusOrder;
        orderId: number;
      }) => {
        // chamar o fluxo com base no status aqui

        cacheAccountSocket
          .get(auth.accountId)
          ?.listSocket?.forEach((sockId) => {
            if (sockId !== socket.id) {
              socket.to(sockId).emit(`order:update-status`, {
                ...props,
                accountId: auth.accountId,
              });
            }
          });

        await prisma.orders.update({
          where: { id: props.orderId, accountId: auth.accountId },
          data: { rank: props.rank, status: props.nextStatus },
        });

        const order = await prisma.orders.findFirst({
          where: { accountId: auth.accountId, id: props.orderId },
          select: {
            flowNodeId: true,
            flowStateId: true,
            flowId: true,
            connectionWAId: true,
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

        if (!order.flowId || !order.flowStateId || !order.connectionWAId)
          return;

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
          (n: any) => n.id === order.flowNodeId
        ) as any;

        const nextEdgesIds = flow.edges
          .filter((f: any) => orderNode?.id === f.source)
          ?.map((nn: any) => {
            return {
              id: nn.target,
              sourceHandle: nn.sourceHandle,
            };
          });

        const nextNodeId = nextEdgesIds?.find((nd: any) =>
          nd.sourceHandle?.includes(props.nextStatus)
        );
        console.log({ nextNodeId });
        if (nextNodeId) {
          const flowState = await prisma.flowState.findFirst({
            where: { id: order.flowStateId },
            select: {
              connectionWAId: true,
              chatbotId: true,
              campaignId: true,
              previous_response_id: true,
              ConnectionWA: { select: { number: true } },
              Chatbot: {
                select: {
                  TimeToRestart: { select: { type: true, value: true } },
                },
              },
            },
          });
          const businessInfo = await prisma.connectionWA.findFirst({
            where: { id: order.connectionWAId },
            select: { Business: { select: { name: true } } },
          });
          const bot = sessionsBaileysWA.get(order.connectionWAId);

          if (
            !businessInfo?.Business ||
            !flowState ||
            !bot ||
            !order.ContactsWAOnAccount ||
            !flowState.ConnectionWA
          ) {
            console.log("caiu aqui no error 2");
            console.log([
              !businessInfo?.Business,
              !flowState,
              !bot,
              !order.ContactsWAOnAccount,
              !flowState?.ConnectionWA,
            ]);
            // tratar error aqui. não encontrou o pedido
            return;
          }

          await NodeControler({
            businessName: businessInfo.Business.name,
            flowId: order.flowId,
            flowBusinessIds: flow.businessIds,
            type: "initial",
            action: null,
            connectionWhatsId: order.connectionWAId,
            chatbotId: flowState.chatbotId || undefined,
            campaignId: flowState.campaignId || undefined,
            oldNodeId: nextNodeId.id,
            previous_response_id: flowState.previous_response_id || undefined,
            clientWA: bot,
            isSavePositionLead: true,
            flowStateId: order.flowStateId,
            contactsWAOnAccountId: order.ContactsWAOnAccount.id,
            lead: {
              number: order.ContactsWAOnAccount!.ContactsWA.completeNumber,
            },
            currentNodeId: nextNodeId.id,
            edges: flow.edges,
            nodes: flow.nodes,
            numberConnection: flowState.ConnectionWA.number + "@s.whatsapp.net",
            accountId: auth.accountId,
            actions: {
              onFinish: async (vl) => {
                const scheduleExecutionCache = scheduleExecutionsReply.get(
                  flowState.ConnectionWA!.number +
                    "@s.whatsapp.net" +
                    order.ContactsWAOnAccount!.ContactsWA.completeNumber +
                    "@s.whatsapp.net"
                );
                if (scheduleExecutionCache) {
                  scheduleExecutionCache.cancel();
                }
                console.log("TA CAINDO AQUI, finalizando fluxo");
                await prisma.flowState.update({
                  where: { id: order.flowStateId! },
                  data: { isFinish: true },
                });
                if (flowState.chatbotId && flowState.Chatbot?.TimeToRestart) {
                  const nextDate = moment()
                    .tz("America/Sao_Paulo")
                    .add(
                      flowState.Chatbot.TimeToRestart.value,
                      flowState.Chatbot.TimeToRestart.type
                    )
                    .toDate();
                  chatbotRestartInDate.set(
                    `${flowState.ConnectionWA!.number}+${
                      order.ContactsWAOnAccount?.ContactsWA.completeNumber
                    }`,
                    nextDate
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
                const indexCurrentAlreadyExist =
                  await prisma.flowState.findFirst({
                    where: {
                      connectionWAId: flowState.connectionWAId,
                      contactsWAOnAccountId: order.ContactsWAOnAccount?.id,
                    },
                    select: { id: true },
                  });
                if (!indexCurrentAlreadyExist) {
                  await prisma.flowState.create({
                    data: {
                      indexNode: node.id,
                      flowId: node.flowId,
                      connectionWAId: flowState.connectionWAId,
                      contactsWAOnAccountId: order.ContactsWAOnAccount?.id,
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
              order.ContactsWAOnAccount!.ContactsWA.completeNumber,
              false
            );
          });
        }
      }
    );
  });

  io.of(/^\/business-\d+\/inbox$/).on("connection", async (socket) => {
    const {
      headers,
      auth,
      //  query
    } = socket.handshake;

    const stateUser = cacheAccountSocket.get(auth.accountId);
    if (!headers["user-agent"] || !stateUser) {
      console.log("Desconectando por falta de informações");
      return socket.disconnect();
    }

    socket.on("disconnect", async (reason) => {
      const stateUser = cacheAccountSocket.get(auth.accountId);
      if (stateUser) {
        stateUser.currentTicket = null;
        cacheAccountSocket.set(auth.accountId, stateUser);
      }
    });

    socket.on("join-ticket", async (props: { id: number | null }) => {
      const stateUser = cacheAccountSocket.get(auth.accountId);
      if (stateUser) {
        if (props.id) {
          stateUser.currentTicket = props.id;
        } else {
          stateUser.currentTicket = null;
        }
        cacheAccountSocket.set(auth.accountId, stateUser);
      }
    });
  });
};

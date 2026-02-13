import { readFileSync, remove } from "fs-extra";
import moment from "moment-timezone";
import { scheduleJob } from "node-schedule";
import { resolve } from "path";
import { sessionsBaileysWA } from "../adapters/Baileys";
import {
  cacheConnectionsWAOnline,
  cacheJobsChatbotQueue,
  scheduleExecutionsReply,
} from "../adapters/Baileys/Cache";
import { prisma } from "../adapters/Prisma/client";
import { ModelFlows } from "../adapters/mongo/models/flows";
import { IPropsControler, NodeControler } from "../libs/FlowBuilder/Control";
import { mongo } from "../adapters/mongo/connection";
import { decrypte } from "../libs/encryption";
import { webSocketEmitToRoom } from "../infra/websocket";
import { resolveHourAndMinute } from "./resolveHour:mm";
// import { clientRedis } from "../adapters/RedisDB";

export interface ChatbotQueue_I {
  "next-execution": Date;
  queue: {
    number: string;
    messageText?: string | null;
    messageImage?: string | null;
    messageImageCation?: string | null;
    messageAudio?: string | null;
    messageVideo?: string | null;
    pushName: string;
  }[];
}

export const startChatbotQueue = (chatbotId: number): Promise<void> => {
  return new Promise(async (res, rej) => {
    // const redis = await clientRedis();
    console.log("INICIOU A FILA DE ESPERA DO ROBO");
    let path = "";
    if (process.env?.NODE_ENV === "production") {
      path = resolve(__dirname, `../bin/chatbot-queue/${chatbotId}.json`);
    } else {
      path = resolve(__dirname, `../../bin/chatbot-queue/${chatbotId}.json`);
    }

    const content: ChatbotQueue_I = JSON.parse(String(readFileSync(path)));

    const nextTimeShorts = Math.floor(Math.random() * (400 - 800)) + 400;
    await new Promise((ress) => setTimeout(ress, nextTimeShorts));

    const nextExecution = moment(content["next-execution"]).tz(
      "America/Sao_Paulo",
    );

    const isBeforeNextExecution = nextExecution.isBefore(
      moment().tz("America/Sao_Paulo"),
    );

    const nextDate = moment().tz("America/Sao_Paulo").add(4, "second").toDate();

    scheduleJob(
      isBeforeNextExecution ? nextDate : nextExecution.toDate(),
      async () => {
        const content2: ChatbotQueue_I = JSON.parse(String(readFileSync(path)));

        try {
          console.log("REMOVEU O ARQUIVO de lista 1");
          await remove(path);
          cacheJobsChatbotQueue.delete(chatbotId);
          console.log("Deletou o cache =====");
        } catch (error) {
          console.error("error pra remover");
          console.log(error);
        }

        console.log("8");

        const infoChatbot = await prisma.chatbot.findFirst({
          where: { id: chatbotId, status: true },
          select: {
            accountId: true,
            Business: { select: { name: true, id: true } },
            flowId: true,
            ConnectionWA: { select: { number: true, id: true } },
            ConnectionIg: { select: { id: true, credentials: true } },
            addToLeadTagsIds: true,
            addLeadToAudiencesIds: true,
          },
        });

        if (!infoChatbot) return;

        let external_adapter: IPropsControler["external_adapter"] | null = null;

        if (infoChatbot.ConnectionWA?.id) {
          let attempt = 0;
          const botOnline = new Promise<boolean>((resolve, reject) => {
            function run() {
              if (attempt >= 5) {
                return resolve(false);
              } else {
                setInterval(async () => {
                  const botWA = cacheConnectionsWAOnline.get(
                    infoChatbot!.ConnectionWA?.id!,
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
            infoChatbot.ConnectionWA?.id!,
          )!;
          external_adapter = {
            type: "baileys",
            clientWA: clientWA,
          };
        }
        if (infoChatbot.ConnectionIg?.id) {
          try {
            const credential = decrypte(infoChatbot.ConnectionIg.credentials);
            external_adapter = {
              type: "instagram",
              page_token: credential.account_access_token,
            };
          } catch (error) {
            return;
          }
        }

        if (!external_adapter) return;

        const connectionId = (infoChatbot.ConnectionWA?.id ||
          infoChatbot.ConnectionIg?.id)!;

        console.log("9");

        for (const leadData of content2.queue) {
          const ContactsWAOnAccount =
            await prisma.contactsWAOnAccount.findFirst({
              where: {
                ContactsWA: { completeNumber: leadData.number },
                accountId: infoChatbot.accountId,
              },
              select: { id: true },
            });

          if (!ContactsWAOnAccount?.id) continue;

          await mongo();
          const flowFetch = await ModelFlows.aggregate([
            {
              $match: {
                accountId: infoChatbot.accountId,
                _id: infoChatbot.flowId,
              },
            },
            {
              $project: {
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
          if (!flowFetch) return console.log(`Flow not found.`);
          console.log("17");

          const { edges, nodes } = flowFetch[0];
          let currentIndexNodeLead = await prisma.flowState.findFirst({
            where: {
              OR: [
                { connectionWAId: infoChatbot.ConnectionWA?.id },
                { connectionIgId: infoChatbot.ConnectionIg?.id },
              ],
              contactsWAOnAccountId: ContactsWAOnAccount.id,
            },
            select: { indexNode: true, id: true, previous_response_id: true },
          });
          console.log("18");

          if (!currentIndexNodeLead) return;
          console.log("19");

          console.log("20");
          await NodeControler({
            businessName: infoChatbot.Business.name,
            flowId: infoChatbot.flowId,
            type: "running",
            action: null,
            businessId: infoChatbot.Business.id,

            external_adapter,
            connectionId,
            lead_id: leadData.number,
            contactAccountId: ContactsWAOnAccount.id,

            oldNodeId: currentIndexNodeLead.indexNode || "0",
            isSavePositionLead: true,
            flowStateId: currentIndexNodeLead.id,
            currentNodeId: currentIndexNodeLead?.indexNode || "0",
            edges: edges,
            nodes: nodes,
            previous_response_id:
              currentIndexNodeLead.previous_response_id || undefined,
            message: leadData.messageText ?? "",
            accountId: infoChatbot.accountId,
            actions: {
              onFinish: async (vl) => {
                if (currentIndexNodeLead) {
                  const scheduleExecutionCache = scheduleExecutionsReply.get(
                    infoChatbot.ConnectionWA!.number +
                      "@s.whatsapp.net" +
                      leadData.number,
                  );
                  if (scheduleExecutionCache) {
                    scheduleExecutionCache.cancel();
                  }
                  console.log("TA CAINDO AQUI");
                  await prisma.flowState.update({
                    where: { id: currentIndexNodeLead.id },
                    data: { isFinish: true, finishedAt: new Date() },
                  });
                  webSocketEmitToRoom()
                    .account(infoChatbot.accountId)
                    .dashboard.dashboard_services({
                      delta: -1,
                      hour: resolveHourAndMinute(),
                    });
                }
              },
              onExecutedNode: async (node) => {
                await prisma.flowState.update({
                  where: { id: currentIndexNodeLead.id },
                  data: { indexNode: node.id, flowId: node.flowId },
                });
              },
            },
          });
        }
      },
    );
    res();
  });
};

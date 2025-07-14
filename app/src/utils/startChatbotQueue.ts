import { readFileSync, remove } from "fs-extra";
import moment from "moment-timezone";
import { scheduleJob } from "node-schedule";
import { resolve } from "path";
import { sessionsBaileysWA } from "../adapters/Baileys";
import {
  cacheJobsChatbotQueue,
  scheduleExecutionsReply,
} from "../adapters/Baileys/Cache";
import { prisma } from "../adapters/Prisma/client";
import { ModelFlows } from "../adapters/mongo/models/flows";
import { NodeControler } from "../libs/FlowBuilder/Control";
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
      path = resolve(__dirname, `./bin/chatbot-queue/${chatbotId}.json`);
    } else {
      path = resolve(__dirname, `./chatbot-queue/${chatbotId}.json`);
    }

    const content: ChatbotQueue_I = JSON.parse(String(readFileSync(path)));

    const nextTimeShorts = Math.floor(Math.random() * (400 - 800)) + 400;
    await new Promise((ress) => setTimeout(ress, nextTimeShorts));

    const connectionFind = await prisma.chatbot.findFirst({
      where: { id: chatbotId, status: true },
      select: {
        connectionWAId: true,
      },
    });

    if (!connectionFind?.connectionWAId) {
      console.log(
        "Chatbot não pode ser iniciado, porque a conexão não foi encontrada ou estava desativada!."
      );
      return res();
    }

    const bot = sessionsBaileysWA.get(connectionFind.connectionWAId);

    if (!bot) {
      console.log(
        "Chatbot não pode ser iniciado, porque a conexão estava offline!."
      );
      return res();
    }

    const nextExecution = moment(content["next-execution"]).tz(
      "America/Sao_Paulo"
    );

    const isBeforeNextExecution = nextExecution.isBefore(
      moment().tz("America/Sao_Paulo")
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
            Business: { select: { name: true } },
            flowId: true,
            ConnectionWA: { select: { number: true, id: true } },
            addToLeadTagsIds: true,
            addLeadToAudiencesIds: true,
          },
        });
        console.log("9");

        if (infoChatbot?.ConnectionWA?.number) {
          for (const leadData of content2.queue) {
            const contactWAAlreadyExists = await prisma.contactsWA.findFirst({
              where: { completeNumber: leadData.number },
              select: { id: true },
            });

            let ContactsWAOnAccount: {
              id: number;
            }[] = [];
            if (!contactWAAlreadyExists) {
              const data = await prisma.contactsWA.create({
                data: {
                  completeNumber: leadData.number,
                  ContactsWAOnAccount: {
                    create: {
                      accountId: infoChatbot.accountId,
                      name: leadData.pushName,
                    },
                  },
                },
                select: {
                  ContactsWAOnAccount: {
                    where: { accountId: infoChatbot.accountId },
                    select: { id: true },
                  },
                },
              });
              ContactsWAOnAccount = data.ContactsWAOnAccount;
            } else {
              const contactWAAccountAlreadyExists =
                await prisma.contactsWAOnAccount.findFirst({
                  where: {
                    accountId: infoChatbot.accountId,
                    ContactsWA: { completeNumber: leadData.number },
                  },
                  select: { id: true },
                });
              if (contactWAAccountAlreadyExists) {
                ContactsWAOnAccount = [
                  { id: contactWAAccountAlreadyExists.id },
                ];
              } else {
                const contactWAAccountAlreadyExists2 =
                  await prisma.contactsWAOnAccount.create({
                    data: {
                      accountId: infoChatbot.accountId,
                      name: leadData.pushName,
                      contactWAId: contactWAAlreadyExists.id,
                    },
                    select: { id: true },
                  });
                ContactsWAOnAccount = [
                  { id: contactWAAccountAlreadyExists2.id },
                ];
              }
            }

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
                connectionWAId: infoChatbot.ConnectionWA.id,
                contactsWAOnAccountId: ContactsWAOnAccount[0].id,
              },
              select: { indexNode: true, id: true },
            });
            console.log("18");

            if (!currentIndexNodeLead) {
              currentIndexNodeLead = await prisma.flowState.create({
                data: {
                  connectionWAId: infoChatbot.ConnectionWA.id,
                  contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                  indexNode: "0",
                  flowId: infoChatbot.flowId,
                },
                select: { indexNode: true, id: true },
              });
            }
            console.log("19");

            const businessInfo = await prisma.connectionWA.findFirst({
              where: { id: infoChatbot.ConnectionWA.id },
              select: { Business: { select: { name: true } } },
            });

            if (!businessInfo) {
              console.log("Connection not found");
              return;
            }

            console.log("20");
            await NodeControler({
              businessName: businessInfo.Business.name,
              flowId: infoChatbot.flowId,
              type: "running",
              connectionWhatsId: infoChatbot.ConnectionWA.id,
              clientWA: bot,
              oldNodeId: currentIndexNodeLead.indexNode || "0",
              isSavePositionLead: true,
              flowStateId: currentIndexNodeLead.id,
              contactsWAOnAccountId: ContactsWAOnAccount[0].id,
              lead: { number: leadData.number + "@s.whatsapp.net" },
              currentNodeId: currentIndexNodeLead?.indexNode || "0",
              edges: edges,
              nodes: nodes,
              numberConnection:
                infoChatbot.ConnectionWA.number + "@s.whatsapp.net",
              message: leadData.messageText ?? "",
              accountId: infoChatbot.accountId,
              actions: {
                onFinish: async (vl) => {
                  if (currentIndexNodeLead) {
                    const scheduleExecutionCache = scheduleExecutionsReply.get(
                      infoChatbot.ConnectionWA!.number +
                        "@s.whatsapp.net" +
                        leadData.number
                    );
                    if (scheduleExecutionCache) {
                      scheduleExecutionCache.cancel();
                    }
                    console.log("TA CAINDO AQUI");
                    await prisma.flowState.update({
                      where: { id: currentIndexNodeLead.id },
                      data: { isFinish: true },
                    });
                  }
                },
                onExecutedNode: async (node) => {
                  const indexCurrentAlreadyExist =
                    await prisma.flowState.findFirst({
                      where: {
                        connectionWAId: infoChatbot.ConnectionWA!.id,
                        contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                      },
                      select: { id: true },
                    });
                  if (!indexCurrentAlreadyExist) {
                    await prisma.flowState.create({
                      data: {
                        indexNode: node.id,
                        flowId: node.flowId,
                        connectionWAId: infoChatbot.ConnectionWA!.id,
                        contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                      },
                    });
                  } else {
                    await prisma.flowState.update({
                      where: { id: indexCurrentAlreadyExist.id },
                      data: { indexNode: node.id, flowId: node.flowId },
                    });
                  }
                },
              },
            });
          }
        }
      }
    );
    res();
  });
};

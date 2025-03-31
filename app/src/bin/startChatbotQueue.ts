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
import { NodeControler } from "../libs/Nodes/Control";
import { clientRedis } from "../adapters/RedisDB";

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
    const redis = await clientRedis();
    console.log("INICIOU A FILA DE ESPERA DO ROBO");
    const pathQueue = resolve(__dirname, `./chatbot-queue/${chatbotId}.json`);
    const content: ChatbotQueue_I = JSON.parse(String(readFileSync(pathQueue)));

    const nextTimeShorts = Math.floor(Math.random() * (400 - 800)) + 400;
    await new Promise((ress) => setTimeout(ress, nextTimeShorts));

    const connectionFind = await prisma.chatbot.findFirst({
      where: { id: chatbotId, status: true },
      select: {
        connectionOnBusinessId: true,
      },
    });

    if (!connectionFind?.connectionOnBusinessId) {
      console.log(
        "Chatbot não pode ser iniciado, porque a conexão não foi encontrada ou estava desativada!."
      );
      return res();
    }

    const bot = sessionsBaileysWA.get(connectionFind.connectionOnBusinessId);

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
        const content2: ChatbotQueue_I = JSON.parse(
          String(readFileSync(pathQueue))
        );

        try {
          console.log("REMOVEU O ARQUIVO de lista 1");
          await remove(pathQueue);
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
            ConnectionOnBusiness: { select: { number: true, id: true } },
            insertTagsLead: true,
            insertNewLeadsOnAudienceId: true,
            typeActivation: true,
            typeMessageWhatsApp: true,
            ChatbotMessageActivationsFail: {
              select: { audio: true, image: true, text: true },
            },
            ChatbotMessageActivations: {
              select: {
                caseSensitive: true,
                type: true,
                ChatbotMessageActivationValues: { select: { value: true } },
              },
            },
            ChatbotAlternativeFlows: {
              select: {
                receivingAudioMessages: true,
                receivingImageMessages: true,
                receivingNonStandardMessages: true,
                receivingVideoMessages: true,
              },
            },
          },
        });
        console.log("9");

        if (infoChatbot && infoChatbot.ConnectionOnBusiness?.number) {
          const {
            typeActivation,
            typeMessageWhatsApp,
            ChatbotMessageActivationsFail,
            ChatbotMessageActivations,
          } = infoChatbot;
          let isValidM = false;
          let flowIdSend = infoChatbot.flowId;
          console.log("10");

          for (const leadData of content2.queue) {
            console.log("11");

            console.log({ leadData });
            if (typeActivation && typeActivation === "message") {
              if (typeMessageWhatsApp === "anyMessage") {
                if (
                  ChatbotMessageActivationsFail?.text &&
                  !!leadData.messageText
                ) {
                  isValidM = true;
                }
                if (
                  ChatbotMessageActivationsFail?.audio &&
                  !!leadData.messageAudio
                ) {
                  isValidM = true;
                }

                if (
                  ChatbotMessageActivationsFail?.image &&
                  !!leadData.messageImage
                ) {
                  isValidM = true;
                }
              }
              if (typeMessageWhatsApp === "textDetermined") {
                const isValidMessage = ChatbotMessageActivations.some(
                  (activation) => {
                    const activationValues =
                      activation.ChatbotMessageActivationValues.map(
                        (chbm) => chbm.value
                      );
                    if (activation.type === "contains") {
                      const regex = new RegExp(
                        `(${activationValues.join("|")})`,
                        `g${activation.caseSensitive ? "i" : ""}`
                      );
                      return regex.test(leadData.messageText ?? "");
                    }
                    if (activation.type === "different") {
                      const regex = new RegExp(
                        `(${activationValues.join("|")})`,
                        activation.caseSensitive ? "i" : undefined
                      );
                      return !regex.test(leadData.messageText ?? "");
                    }
                    if (activation.type === "equal") {
                      const regex = new RegExp(
                        `^(${activationValues.join("|")})$`,
                        activation.caseSensitive ? "i" : undefined
                      );
                      return regex.test(leadData.messageText ?? "");
                    }
                    if (activation.type === "startWith") {
                      const regex = new RegExp(
                        `^(${activationValues.join("|")})`,
                        activation.caseSensitive ? "i" : undefined
                      );
                      return regex.test(leadData.messageText ?? "");
                    }
                  }
                );
                if (!isValidMessage) {
                  const {
                    receivingAudioMessages,
                    receivingImageMessages,
                    receivingNonStandardMessages,
                    receivingVideoMessages,
                  } = infoChatbot.ChatbotAlternativeFlows!;
                  const isText =
                    receivingNonStandardMessages && !!leadData.messageText;
                  if (isText) {
                    flowIdSend = receivingNonStandardMessages;
                    isValidM = true;
                  }
                  if (receivingAudioMessages && !!leadData.messageAudio) {
                    flowIdSend = receivingAudioMessages;
                    isValidM = true;
                  }
                  if (receivingImageMessages && !!leadData.messageImage) {
                    flowIdSend = receivingImageMessages;
                    isValidM = true;
                  }
                  if (receivingVideoMessages && !!leadData.messageVideo) {
                    flowIdSend = receivingVideoMessages;
                    isValidM = true;
                  }
                }
                isValidM = true;
              }
              console.log({ isValidM });
              console.log("12");

              if (isValidM) {
                const contactWAAlreadyExists =
                  await prisma.contactsWA.findFirst({
                    where: { completeNumber: leadData.number },
                    select: { id: true },
                  });
                console.log("13");

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
                console.log("14");

                const { insertTagsLead, insertNewLeadsOnAudienceId } =
                  infoChatbot;

                if (insertTagsLead) {
                  const listTagsIdsLead: number[] = insertTagsLead
                    .split("-")
                    .map((s) => JSON.parse(s));
                  const tagOnBusinessIds = await prisma.tagOnBusiness.findMany({
                    where: { tagId: { in: listTagsIdsLead } },
                    select: { id: true },
                  });
                  tagOnBusinessIds.forEach(({ id }) => {
                    prisma.tagOnBusinessOnContactsWAOnAccount.create({
                      data: {
                        contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                        tagOnBusinessId: id,
                      },
                    });
                  });
                }
                console.log("15");

                if (insertNewLeadsOnAudienceId) {
                  prisma.contactsWAOnAccountOnAudience.create({
                    data: {
                      audienceId: insertNewLeadsOnAudienceId,
                      contactWAOnAccountId: ContactsWAOnAccount[0].id,
                    },
                  });
                }
                console.log("16");

                const flowFetch = await ModelFlows.aggregate([
                  {
                    $match: {
                      accountId: infoChatbot.accountId,
                      _id: flowIdSend,
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
                    connectionOnBusinessId: infoChatbot.ConnectionOnBusiness.id,
                    contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                  },
                  select: { indexNode: true, id: true },
                });
                console.log("18");

                if (!currentIndexNodeLead) {
                  currentIndexNodeLead = await prisma.flowState.create({
                    data: {
                      connectionOnBusinessId:
                        infoChatbot.ConnectionOnBusiness.id,
                      contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                      type: "chatbot",
                      indexNode: "0",
                      flowId: flowIdSend,
                    },
                    select: { indexNode: true, id: true },
                  });
                }
                console.log("19");

                const businessInfo =
                  await prisma.connectionOnBusiness.findFirst({
                    where: { id: infoChatbot.ConnectionOnBusiness.id },
                    select: { Business: { select: { name: true } } },
                  });

                console.log("20");
                await NodeControler({
                  businessName: businessInfo?.Business.name!,
                  flowId: flowIdSend,
                  type: "running",
                  connectionWhatsId: infoChatbot.ConnectionOnBusiness.id,
                  clientWA: bot,
                  isSavePositionLead: true,
                  flowStateId: currentIndexNodeLead.id,
                  contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                  lead: { number: leadData.number + "@s.whatsapp.net" },
                  currentNodeId: currentIndexNodeLead?.indexNode ?? "0",
                  edges: edges,
                  nodes: nodes,
                  numberConnection:
                    infoChatbot.ConnectionOnBusiness.number + "@s.whatsapp.net",
                  message: leadData.messageText ?? "",
                  accountId: infoChatbot.accountId,
                  onFinish: async (vl) => {
                    if (currentIndexNodeLead) {
                      const scheduleExecutionCache =
                        scheduleExecutionsReply.get(
                          infoChatbot.ConnectionOnBusiness!.number +
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
                          connectionOnBusinessId:
                            infoChatbot.ConnectionOnBusiness!.id,
                          contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                        },
                        select: { id: true },
                      });
                    if (!indexCurrentAlreadyExist) {
                      await prisma.flowState.create({
                        data: {
                          type: "chatbot",
                          indexNode: node.id,
                          connectionOnBusinessId:
                            infoChatbot.ConnectionOnBusiness!.id,
                          contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                        },
                      });
                    } else {
                      await prisma.flowState.update({
                        where: { id: indexCurrentAlreadyExist.id },
                        data: { indexNode: node.id },
                      });
                    }
                  },
                });
              }
            }
          }
        }
      }
    );
    res();
  });
};

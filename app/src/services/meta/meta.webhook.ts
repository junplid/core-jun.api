import { Request, Response } from "express";
import { getMetaAccessToken, getMetaLongAccessToken } from "./meta.auth";
import { getMetaAccountsIg, getMetaLeadInfo } from "./meta.service";
import { prisma } from "../../adapters/Prisma/client";
import { metaAccountsCache } from "./cache";
import { socketIo } from "../../infra/express";
import { AxiosError } from "axios";
import { decrypte } from "../../libs/encryption";
import {
  cacheFlowsMap,
  cacheJobsChatbotQueue,
  cacheSendMessageSuportText,
  chatbotRestartInDate,
  leadAwaiting,
  scheduleExecutionsReply,
} from "../../adapters/Baileys/Cache";
import { sendMetaTextMessage } from "./modules/sendTextMessage";
import moment, { Moment } from "moment-timezone";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { NodeControler } from "../../libs/FlowBuilder/Control";
import { existsSync, readFileSync, writeFile } from "fs-extra";
import { startChatbotQueue } from "../../utils/startChatbotQueue";
import { sendMetaMarkSeen } from "./modules/markSeen";
import { sendMetaTyping } from "./modules/typing";
import { resolve } from "path";
import { webSocketEmitToRoom } from "../../infra/websocket";
import { resolveHourAndMinute } from "../../utils/resolveHour:mm";

const handleLead = async (props: {
  accountId: number;
  lead_id: string;
  account_access_token: string;
  page_id: string;
}): Promise<{ contactAccountId: number; name: string | null }> => {
  let contactAccountId: null | number = null;
  let name: null | string = null;
  const contactAccount = await prisma.contactsWAOnAccount.findFirst({
    where: {
      ContactsWA: {
        channel: "instagram",
        page_id: props.page_id,
        completeNumber: props.lead_id,
      },
      accountId: props.accountId,
    },
    select: { id: true, name: true },
  });

  if (contactAccount?.id) {
    contactAccountId = contactAccount.id;
    name = contactAccount.name;
  } else {
    const getLead = await prisma.contactsWA.findFirst({
      where: {
        completeNumber: props.lead_id,
        channel: "instagram",
        page_id: props.page_id,
      },
      select: { id: true, name: true },
    });

    if (!getLead) {
      try {
        const lead = await getMetaLeadInfo({
          sender_id: props.lead_id,
          page_token: props.account_access_token!,
        });
        const newLead = await prisma.contactsWA.create({
          data: {
            completeNumber: props.lead_id,
            channel: "instagram",
            page_id: props.page_id,
            img: lead.picture,
            name: lead.name,
            username: lead.username,
          },
          select: { id: true },
        });
        const { id } = await prisma.contactsWAOnAccount.create({
          data: {
            contactWAId: newLead.id,
            accountId: props.accountId,
            name: lead.name,
          },
          select: { id: true },
        });
        contactAccountId = id;
        name = lead.name;
      } catch (error: any) {
        console.error(
          "Erro ao buscar perfil do Instagram:",
          error.response?.data || error.message,
        );
        throw "Erro ao buscar perfil do Instagram:";
      }
    } else {
      const { id } = await prisma.contactsWAOnAccount.create({
        data: {
          contactWAId: getLead.id,
          accountId: props.accountId,
          name: getLead.name!,
        },
        select: { id: true },
      });
      contactAccountId = id;
      name = getLead.name;
    }
  }

  return { contactAccountId, name };
};

interface ChatbotQueue {
  "next-execution": Moment;
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

function getTimeBR(time: string) {
  return moment()
    .tz("America/Sao_Paulo")
    .set({
      hours: Number(time.slice(0, 2)),
      minutes: Number(time.slice(3, 5)),
    });
}

function CalculeTypingDelay(text: string, ms = 150) {
  const delay = text.split(" ").length * (ms / 1000);
  return delay < 1.9 ? 1.9 : delay;
}

let pathChatbotQueue = "";
if (process.env.NODE_ENV === "production") {
  pathChatbotQueue = resolve(__dirname, `../bin/chatbot-queue`);
} else {
  pathChatbotQueue = resolve(__dirname, `../../../bin/chatbot-queue`);
}

export async function metaWebhook(req: Request, res: Response) {
  console.log("INSTAGRAM WEBHOOK:", JSON.stringify(req.body, null, 2));
  if (req.body.object === "instagram") {
    req.body.entry.forEach(async (entry: any) => {
      const page_id = entry.id;

      const connectionIg = await prisma.connectionIg.findFirst({
        where: { page_id, interrupted: false },
        select: {
          id: true,
          credentials: true,
          Business: { select: { accountId: true, name: true } },
        },
      });

      if (!connectionIg?.credentials) return;
      let account_access_token: null | string = null;

      try {
        const credential = decrypte(connectionIg.credentials);
        account_access_token = credential.account_access_token;
      } catch (error) {
        return;
      }

      for await (const event of entry.messaging || entry.changes) {
        try {
          if (event.message && event.message.is_echo) {
            const findMsg = await prisma.messages.findFirst({
              where: { messageKey: event.message.mid },
              select: { id: true },
            });
            if (!findMsg) continue;
            await prisma.messages.update({
              where: { id: findMsg.id },
              data: { status: "DELIVERED" },
            });

            // mandar via websocket a atualização do status
            continue;
          }
          const identifierLead = event.sender.id;

          const { contactAccountId, name: pushName } = await handleLead({
            accountId: connectionIg.Business.accountId,
            lead_id: identifierLead,
            account_access_token: account_access_token!,
            page_id,
          });
          if (!event.message?.is_echo) {
            await prisma.contactsWAOnAccount.update({
              where: { id: contactAccountId },
              data: { last_interaction: new Date() },
            });
          }

          const keyMapLead = `${connectionIg.id}+${identifierLead}`;

          // procurar ticket;

          // procurar chatbot;
          const chatbot = await prisma.chatbot.findFirst({
            where: { ConnectionIg: { page_id }, status: true },
            select: {
              id: true,
              flowId: true,
              fallback: true,
              addToLeadTagsIds: true,
              addLeadToAudiencesIds: true,
              connectionIgId: true,
              status: true,
              Business: { select: { name: true, id: true } },
              OperatingDays: {
                select: {
                  dayOfWeek: true,
                  WorkingTimes: { select: { end: true, start: true } },
                },
              },
              TimeToRestart: { select: { type: true, value: true } },
              trigger: true,
              flowBId: true,
            },
          });
          if (chatbot?.connectionIgId) {
            let currentIndexNodeLead = await prisma.flowState.findFirst({
              where: {
                connectionIgId: chatbot.connectionIgId,
                contactsWAOnAccountId: contactAccountId,
                isFinish: false,
              },
              select: {
                indexNode: true,
                id: true,
                previous_response_id: true,
                fallbackSent: true,
              },
            });

            if (!currentIndexNodeLead) {
              currentIndexNodeLead = await prisma.flowState.create({
                data: {
                  connectionIgId: chatbot.connectionIgId,
                  contactsWAOnAccountId: contactAccountId,
                  indexNode: "0",
                  flowId: chatbot.flowId,
                  chatbotId: chatbot.id,
                },
                select: {
                  fallbackSent: true,
                  indexNode: true,
                  id: true,
                  previous_response_id: true,
                },
              });

              webSocketEmitToRoom()
                .account(connectionIg.Business.accountId)
                .dashboard.dashboard_services({
                  delta: +1,
                  hour: resolveHourAndMinute(),
                });
            }

            const messageText = event.message.text;

            if (!messageText) {
              const isSendMessageSuportText =
                cacheSendMessageSuportText.get(keyMapLead);
              if (!isSendMessageSuportText) {
                const { message_id } = await sendMetaTextMessage({
                  text: "*Mensagem automática*\nEste chat ainda só oferece suporte a mensagens de texto.",
                  page_token: account_access_token!,
                  recipient_id: identifierLead,
                });
                await prisma.messages.create({
                  data: {
                    messageKey: message_id,
                    by: "system",
                    message:
                      "*Mensagem automática*\nEste chat ainda só oferece suporte a mensagens de texto.",
                    type: "text",
                    flowStateId: currentIndexNodeLead.id,
                    status: "DELIVERED",
                  },
                });
                continue;
              }
              continue;
            }

            await prisma.messages.create({
              data: {
                by: "contact",
                message: messageText,
                type: "text",
                messageKey: event.message.mid,
                flowStateId: currentIndexNodeLead.id,
                status: "DELIVERED",
              },
            });

            const isToRestartChatbot = chatbotRestartInDate.get(keyMapLead);

            if (!!isToRestartChatbot) {
              const isbefore = moment()
                .tz("America/Sao_Paulo")
                .isBefore(isToRestartChatbot);
              console.log({ isbefore });
              if (isbefore) {
                continue;
              } else {
                chatbotRestartInDate.delete(keyMapLead);
              }
            }

            if (chatbot.addToLeadTagsIds.length) {
              const tags = await prisma.tag.findMany({
                where: { id: { in: chatbot.addToLeadTagsIds } },
                select: { id: true },
              });
              for await (const { id } of tags) {
                const isExist = await prisma.tagOnContactsWAOnAccount.findFirst(
                  {
                    where: {
                      contactsWAOnAccountId: contactAccountId,
                      tagId: id,
                    },
                  },
                );
                if (!isExist) {
                  await prisma.tagOnContactsWAOnAccount.create({
                    data: {
                      contactsWAOnAccountId: contactAccountId,
                      tagId: id,
                    },
                  });
                }
              }
            }

            if (chatbot.status) {
              const validMsgChatbot = async () => {
                let flow: any = null;
                if (
                  (chatbot.trigger && chatbot.trigger === messageText) ||
                  !chatbot.trigger
                ) {
                  flow = cacheFlowsMap.get(chatbot.flowId);
                  if (!flow) {
                    const flowFetch = await ModelFlows.aggregate([
                      {
                        $match: {
                          accountId: connectionIg.Business.accountId,
                          _id: chatbot.flowId,
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
                      // const hash = ulid();
                      // isso ta errado. todos vao receber esse log, inclusive usuario.
                      // cacheRootSocket.forEach((sockId) =>
                      //   socketIo.to(sockId).emit(`geral-logs`, {
                      //     hash,
                      //     entity: "flows",
                      //     type: "WARN",
                      //     value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - flow: #${chatbot.flowId} | Not found`,
                      //   }),
                      // );
                      // await prisma.geralLogDate.create({
                      //   data: {
                      //     hash,
                      //     entity: "flows",
                      //     type: "WARN",
                      //     value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - flow: #${chatbot.flowId} | Not found`,
                      //   },
                      // });
                      return console.log(`Flow not found. 2`);
                    }
                    const { edges, nodes, businessIds } = flowFetch[0];
                    flow = { edges, nodes, businessIds };
                    cacheFlowsMap.set(chatbot.flowId, flow);
                  }
                }

                if (chatbot.trigger && chatbot.trigger !== messageText) {
                  if (!chatbot.flowBId) return;
                  flow = cacheFlowsMap.get(chatbot.flowBId);
                  if (!flow) {
                    const flowFetch = await ModelFlows.aggregate([
                      {
                        $match: {
                          accountId: connectionIg.Business.accountId,
                          _id: chatbot.flowBId,
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
                      // const hash = ulid();
                      // cacheRootSocket.forEach((sockId) =>
                      //   socketIo.to(sockId).emit(`geral-logs`, {
                      //     hash,
                      //     entity: "flows",
                      //     type: "WARN",
                      //     value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - flow: #${chatbot.flowId} | Not found`,
                      //   }),
                      // );
                      // await prisma.geralLogDate.create({
                      //   data: {
                      //     hash,
                      //     entity: "flows",
                      //     type: "WARN",
                      //     value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - flow: #${chatbot.flowId} | Not found`,
                      //   },
                      // });
                      return console.log(`Flow not found. 3`);
                    }
                    const { edges, nodes, businessIds } = flowFetch[0];
                    flow = { edges, nodes, businessIds };
                    cacheFlowsMap.set(chatbot.flowId, flow);
                  }
                }

                if (!flow) {
                  // const hash = ulid();
                  // cacheRootSocket.forEach((sockId) =>
                  //   socketIo.to(sockId).emit(`geral-logs`, {
                  //     hash,
                  //     entity: "flows",
                  //     type: "WARN",
                  //     value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - flow: #${chatbot.flowId} | Not found`,
                  //   }),
                  // );
                  // await prisma.geralLogDate.create({
                  //   data: {
                  //     hash,
                  //     entity: "flows",
                  //     type: "WARN",
                  //     value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - flow: #${chatbot.flowId} | Not found`,
                  //   },
                  // });
                  return console.log(`Flow não encontrado.`);
                }

                // ainda nao trabalhamos com audio.
                // let fileName = "";
                // if (messageAudio) {
                //   const ext = mime.extension(
                //     messageAudio.mimetype || "audio/mpeg",
                //   );
                //   fileName = `audio_inbox_${Date.now()}.${ext}`;
                //   try {
                //     const buffer = await downloadMediaMessage(
                //       body.messages[0],
                //       "buffer",
                //       {},
                //     );
                //     writeFileSync(
                //       pathStatic + `/${fileName}`,
                //       new Uint8Array(buffer),
                //     );
                //     leadAwaiting.set(keyMapLeadAwaiting, false);
                //   } catch (error) {
                //     const hash = ulid();
                //     cacheRootSocket.forEach((sockId) =>
                //       socketIo.to(sockId).emit(`geral-logs`, {
                //         hash,
                //         entity: "baileys",
                //         type: "WARN",
                //         value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} | Error ao tentar salvar AUDIO recebido no chatbot`,
                //       }),
                //     );
                //     await prisma.geralLogDate.create({
                //       data: {
                //         hash,
                //         entity: "baileys",
                //         type: "WARN",
                //         value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} | Error ao tentar salvar AUDIO recebido no chatbot`,
                //       },
                //     });
                //     console.log(error);
                //   }
                // }

                await NodeControler({
                  businessName: chatbot.Business.name,
                  flowId: chatbot.flowId,
                  businessId: chatbot.Business.id,
                  flowBusinessIds: flow.businessIds,
                  type: "running",
                  external_adapter: {
                    type: "instagram",
                    page_token: account_access_token!,
                  },
                  connectionId: connectionIg.id,
                  chatbotId: chatbot.id,
                  oldNodeId: currentIndexNodeLead?.indexNode || "0",
                  previous_response_id:
                    currentIndexNodeLead.previous_response_id || undefined,
                  isSavePositionLead: true,
                  flowStateId: currentIndexNodeLead.id,
                  contactAccountId: contactAccountId!,
                  lead_id: identifierLead,
                  currentNodeId: currentIndexNodeLead?.indexNode || "0",
                  edges: flow.edges,
                  nodes: flow.nodes,
                  message: messageText ?? "",
                  accountId: connectionIg.Business.accountId,
                  action: null,
                  actions: {
                    onErrorClient: async (vl) => {
                      if (currentIndexNodeLead) {
                        const scheduleExecutionCache =
                          scheduleExecutionsReply.get(keyMapLead);
                        if (scheduleExecutionCache) {
                          scheduleExecutionCache.cancel();
                        }
                        console.log("TA CAINDO AQUI, finalizando fluxo");
                        await prisma.flowState.update({
                          where: { id: currentIndexNodeLead.id },
                          data: { isFinish: true, finishedAt: new Date() },
                        });
                        webSocketEmitToRoom()
                          .account(connectionIg.Business.accountId)
                          .dashboard.dashboard_services({
                            delta: -1,
                            hour: resolveHourAndMinute(),
                          });
                        if (chatbot.TimeToRestart) {
                          const nextDate = moment()
                            .tz("America/Sao_Paulo")
                            .add(
                              chatbot.TimeToRestart.value,
                              chatbot.TimeToRestart.type,
                            )
                            .toDate();
                          chatbotRestartInDate.set(keyMapLead, nextDate);
                        }
                      }
                    },
                    onFinish: async (vl) => {
                      if (currentIndexNodeLead) {
                        const scheduleExecutionCache =
                          scheduleExecutionsReply.get(keyMapLead);
                        if (scheduleExecutionCache) {
                          scheduleExecutionCache.cancel();
                        }
                        console.log("TA CAINDO AQUI, finalizando fluxo");
                        await prisma.flowState.update({
                          where: { id: currentIndexNodeLead.id },
                          data: { isFinish: true, finishedAt: new Date() },
                        });
                        webSocketEmitToRoom()
                          .account(connectionIg.Business.accountId)
                          .dashboard.dashboard_services({
                            delta: -1,
                            hour: resolveHourAndMinute(),
                          });
                        if (chatbot.TimeToRestart) {
                          const nextDate = moment()
                            .tz("America/Sao_Paulo")
                            .add(
                              chatbot.TimeToRestart.value,
                              chatbot.TimeToRestart.type,
                            )
                            .toDate();
                          chatbotRestartInDate.set(keyMapLead, nextDate);
                        }
                      }
                    },
                    onExecutedNode: async (node) => {
                      if (currentIndexNodeLead?.id) {
                        try {
                          await prisma.flowState
                            .update({
                              where: { id: currentIndexNodeLead.id },
                              data: { indexNode: node.id },
                            })
                            .catch((err) => console.log(err));
                        } catch (error) {
                          // const hash = ulid();
                          // cacheRootSocket.forEach((sockId) =>
                          //   socketIo.to(sockId).emit(`geral-logs`, {
                          //     hash,
                          //     entity: "flowState",
                          //     type: "WARN",
                          //     value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - flowState: #${currentIndexNodeLead.id} | Error ao atualizar flowState`,
                          //   }),
                          // );
                          // await prisma.geralLogDate.create({
                          //   data: {
                          //     hash,
                          //     entity: "flowState",
                          //     type: "WARN",
                          //     value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - flowState: #${currentIndexNodeLead.id} | Error ao atualizar flowState`,
                          //   },
                          // });
                          console.log("Error ao atualizar flowState!");
                        }
                      }
                    },
                    onEnterNode: async (node) => {
                      await prisma.flowState.update({
                        where: { id: currentIndexNodeLead.id },
                        data: {
                          indexNode: node.id,
                          flowId: node.flowId,
                          agentId: node.agentId || null,
                        },
                      });
                    },
                  },
                }).finally(() => {
                  leadAwaiting.set(keyMapLead, false);
                });
              };

              if (!chatbot.OperatingDays.length) {
                return await validMsgChatbot();
              }

              const nowTime = moment().tz("America/Sao_Paulo");
              const dayOfWeek = nowTime.get("weekday");

              const validTime = chatbot.OperatingDays.some((day) => {
                if (day.dayOfWeek === dayOfWeek) {
                  if (day.WorkingTimes?.length) {
                    const valid = day.WorkingTimes.some(({ end, start }) => {
                      const isbet = nowTime.isBetween(
                        getTimeBR(start),
                        getTimeBR(end),
                      );
                      console.log({ isbet, end, start, nowTime });
                      return isbet;
                    });
                    return valid;
                  } else {
                    return true;
                  }
                }
              });

              if (!validTime) {
                if (chatbot.fallback) {
                  if (!currentIndexNodeLead.fallbackSent) {
                    await new Promise((resolve) =>
                      setTimeout(resolve, 1000 * 4),
                    );
                    await sendMetaMarkSeen({
                      page_token: account_access_token!,
                      recipient_id: identifierLead,
                    });
                    await new Promise((resolve) => setTimeout(resolve, 700));
                    await sendMetaTyping({
                      page_token: account_access_token!,
                      recipient_id: identifierLead,
                      delay: CalculeTypingDelay(chatbot.fallback),
                    });
                    const { message_id } = await sendMetaTextMessage({
                      page_token: account_access_token!,
                      recipient_id: identifierLead,
                      text: chatbot.fallback,
                    });
                    await prisma.messages.create({
                      data: {
                        by: "system",
                        message: chatbot.fallback,
                        type: "text",
                        messageKey: message_id,
                        flowStateId: currentIndexNodeLead.id,
                      },
                    });
                    await prisma.flowState.update({
                      where: { id: currentIndexNodeLead.id },
                      data: { fallbackSent: true },
                    });
                  }
                }

                const minutesToNextExecutionInQueue = Math.min(
                  ...chatbot.OperatingDays.map((day) => {
                    const nowDate = moment().tz("America/Sao_Paulo");
                    const listNextWeeks = day.WorkingTimes.map((time) => {
                      const [hour, minute] = time.start.split(":").map(Number);
                      let next = moment()
                        .tz("America/Sao_Paulo")
                        .day(day.dayOfWeek)
                        .hour(hour)
                        .minute(minute)
                        .second(0);
                      if (next.isBefore(nowDate)) next = next.add(1, "week");
                      return next.diff(nowDate, "minutes");
                    });

                    return Math.min(...listNextWeeks);
                  }).filter((s) => s >= 0),
                );

                console.log({ minutesToNextExecutionInQueue });
                if (minutesToNextExecutionInQueue > 239) return;

                const dateNextExecution = moment()
                  .tz("America/Sao_paulo")
                  .add(minutesToNextExecutionInQueue, "minutes");

                const dataLeadQueue = {
                  number: identifierLead,
                  pushName: pushName ?? "SEM NOME",
                  messageText,
                  //  messageAudio: messageAudio?.url,
                  //  messageImage: messageImage?.url,
                  //  messageImageCation: capitionImage,
                  //  messageVideo,
                };

                const pathOriginal = pathChatbotQueue + `/${chatbot.id}.json`;

                console.log({ pathOriginal });
                if (!existsSync(pathOriginal)) {
                  console.info("======= Path não existia");
                  try {
                    console.info("======= Escrevendo PATH");

                    await writeFile(
                      pathOriginal,
                      JSON.stringify({
                        "next-execution": dateNextExecution,
                        queue: [dataLeadQueue],
                      } as ChatbotQueue),
                    );
                  } catch (error) {
                    console.error("======= Error ao tentar escrever path");
                    console.log(error);
                  }
                } else {
                  const chatbotQueue = readFileSync(pathOriginal).toString();

                  if (chatbotQueue !== "") {
                    const JSONQueue: ChatbotQueue = JSON.parse(chatbotQueue);
                    if (
                      !JSONQueue.queue.some((s) => s.number === identifierLead)
                    ) {
                      JSONQueue.queue.push(dataLeadQueue);
                    }
                    try {
                      await writeFile(pathOriginal, JSON.stringify(JSONQueue));
                    } catch (error) {
                      console.log(error);
                    }
                  } else {
                    try {
                      await writeFile(
                        pathOriginal,
                        JSON.stringify({
                          "next-execution": dateNextExecution,
                          queue: [dataLeadQueue],
                        } as ChatbotQueue),
                      );
                    } catch (error) {
                      console.log(error);
                    }
                  }
                  console.log("AQUI 2");
                }
                const cacheThisChatbot = cacheJobsChatbotQueue.get(chatbot.id);
                if (!cacheThisChatbot) {
                  await startChatbotQueue(chatbot.id);
                }
              } else {
                return await validMsgChatbot();
              }
            }
          }
        } catch (error) {
          console.log(error);
          continue;
        }
      }
    });
    return res.status(200).send("EVENT_RECEIVED");
  }

  return res.status(200).send("EVENT_RECEIVED");
}

export async function metaVerifyWebhook(req: Request, res: Response) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === "instagram_webhook_token_123") {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
}

export async function metaIgCallbackWebhook(req: Request, res: Response) {
  const { code, state: modal_id } = req.query;

  if (!code) return res.send("<script>window.close();</script>");

  try {
    const access_token = await getMetaAccessToken(code as string);
    const long_access_token = await getMetaLongAccessToken(access_token);
    const accounts = await getMetaAccountsIg(long_access_token);

    const resolveAccounts = await Promise.all(
      accounts.map(async (s) => {
        const get = await prisma.connectionIg.findFirst({
          where: { ig_id: s.ig_id },
          select: {
            id: true,
            Chatbot: { select: { name: true, id: true } },
          },
        });
        return { ...s, used_by: get?.Chatbot.length ? get.Chatbot : [] };
      }),
    );
    metaAccountsCache.set(
      modal_id as string,
      resolveAccounts.filter((s) => !s.used_by.length),
    );
    socketIo.to(modal_id as string).emit(
      "receber_accounts",
      resolveAccounts.map(({ page_token, ...s }) => ({ ...s })),
    );
    return res.send("<script>window.close();</script>");
  } catch (error: any) {
    console.log(error);
    if (error instanceof AxiosError) {
      res.json(error.response?.data);
    }
  }
}

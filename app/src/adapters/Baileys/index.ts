import { Boom } from "@hapi/boom";
import pino from "pino";
import makeWASocket, {
  Browsers,
  DisconnectReason,
  WAConnectionState,
  WAPrivacyOnlineValue,
  WAReadReceiptsValue,
  WASocket,
  downloadMediaMessage,
  fetchLatestBaileysVersion,
  jidNormalizedUser,
  useMultiFileAuthState,
} from "baileys";
import { writeFileSync } from "fs";
import {
  emptyDirSync,
  ensureDirSync,
  existsSync,
  readFileSync,
  writeFile,
} from "fs-extra";
import moment, { Moment } from "moment-timezone";
import { resolve } from "path";
import { Socket } from "socket.io";
import { socketIo } from "../../infra/express";
import {
  cacheAccountSocket,
  cacheRootSocket,
} from "../../infra/websocket/cache";
import { NodeControler } from "../../libs/FlowBuilder/Control";
import { prisma } from "../Prisma/client";
import { ModelFlows } from "../mongo/models/flows";
import {
  cacheConnectionsWAOnline,
  cacheJobsChatbotQueue,
  cacheFlowsMap,
  leadAwaiting,
  scheduleExecutionsReply,
  chatbotRestartInDate,
  cachePendingReactionsList,
  cacheRunningQueueReaction,
  cacheSendMessageSuportText,
} from "./Cache";
import { startChatbotQueue } from "../../utils/startChatbotQueue";
import mime from "mime-types";
import { SendMessageText } from "./modules/sendMessage";
import { TypingDelay } from "./modules/typing";
import { TypeStatusCampaign, WAPrivacyValue } from "@prisma/client";
import NodeCache from "node-cache";
import { ulid } from "ulid";
import { mongo } from "../mongo/connection";
import { NotificationApp } from "../../utils/notificationApp";
import { webSocketEmitToRoom } from "../../infra/websocket";
import { resolveHourAndMinute } from "../../utils/resolveHour:mm";
import { handleFileTemp } from "../../utils/handleFileTemp";

function CalculeTypingDelay(text: string, ms = 150) {
  const delay = text.split(" ").length * (ms / 1000);
  return delay < 1.9 ? 1.9 : delay;
}

function getTimeBR(time: string) {
  return moment()
    .tz("America/Sao_Paulo")
    .set({
      hours: Number(time.slice(0, 2)),
      minutes: Number(time.slice(3, 5)),
    });
}

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

export enum EnumFunctionPromise {
  finish = 0,
  continue = 1,
}

export const FunctionPromise = {
  finish: 0,
  continue: 1,
};

export const sessionsBaileysWA = new Map<number, WASocket>();

interface PropsBaileys {
  accountId: number;
  connectionWhatsId: number;
  socket?: Socket;
  onConnection?(
    connection: WAConnectionState | "connectionLost" | undefined,
    bot?: WASocket,
  ): void;
  maxConnectionAttempts?: number;
  number?: string;
}

export type CacheSessionsBaileysWA = Omit<
  PropsBaileys,
  "socket" | "onConnection"
>;

export const killConnectionWA = async (
  connectionId: number,
  accountId: number,
) => {
  let path = "";
  if (process.env.NODE_ENV === "production") {
    path = resolve(__dirname, `../bin/connections.json`);
  } else {
    path = resolve(__dirname, `../../../bin/connections.json`);
  }
  const connectionsList: CacheSessionsBaileysWA[] = JSON.parse(
    readFileSync(path).toString(),
  );
  const newConnectionsList = connectionsList.filter(
    (c) => c.connectionWhatsId !== connectionId,
  );
  writeFileSync(path, JSON.stringify(newConnectionsList));
  const alreadyExist = !!(await prisma.connectionWA.findFirst({
    where: {
      id: connectionId,
      Business: { accountId },
    },
    select: { id: true },
  }));
  if (alreadyExist) {
    await prisma.connectionWA.update({
      where: { id: connectionId, Business: { accountId } },
      data: { number: null },
    });
  }
  const bot = sessionsBaileysWA.get(connectionId);
  if (bot) {
    bot.ev.removeAllListeners("group-participants.update");
    bot.ev.removeAllListeners("connection.update");
    bot.ev.removeAllListeners("messages.upsert");
    bot.ev.removeAllListeners("groups.update");
    bot.ev.removeAllListeners("creds.update");
    bot.ev.removeAllListeners("messages.reaction");

    if (cacheConnectionsWAOnline.get(connectionId)) {
      try {
        await bot.logout();
      } catch (err) {
        console.error("Erro no logout:", err);
      }
    }

    bot.end({ message: "Sessão encerrada pelo usuário", name: "USER_LOGOUT" });
    sessionsBaileysWA.delete(connectionId);
  }

  cacheConnectionsWAOnline.delete(connectionId);

  if (process.env.NODE_ENV === "production") {
    path = resolve(__dirname, `../database-whatsapp/${connectionId}`);
  } else {
    path = resolve(__dirname, `../../../database-whatsapp/${connectionId}`);
  }

  if (existsSync(path)) emptyDirSync(path);
};

type BaileysStatus = "connecting" | "open" | "close";

let pathStatic = "";
if (process.env.NODE_ENV === "production") {
  pathStatic = resolve(__dirname, `../static/storage`);
} else {
  pathStatic = resolve(__dirname, `../../../static/storage`);
}

let pathDataBaseWA = "";
if (process.env.NODE_ENV === "production") {
  pathDataBaseWA = resolve(__dirname, `../database-whatsapp`);
} else {
  pathDataBaseWA = resolve(__dirname, `../../../database-whatsapp`);
}

let pathChatbotQueue = "";
if (process.env.NODE_ENV === "production") {
  pathChatbotQueue = resolve(__dirname, `../bin/chatbot-queue`);
} else {
  pathChatbotQueue = resolve(__dirname, `../../../bin/chatbot-queue`);
}
const groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false });
export const messageCache = new NodeCache({ stdTTL: 0, useClones: false });

const logger = pino({
  level: "warn", // error + warn
});

export const Baileys = ({ socket, ...props }: PropsBaileys): Promise<void> => {
  let attempts = 0;
  return new Promise((res, rej) => {
    const run = async (restart: boolean = false) => {
      try {
        function emitStatus(status: BaileysStatus) {
          webSocketEmitToRoom()
            .account(props.accountId)
            .connections.status_connection(
              {
                connectionId: props.connectionWhatsId,
                connection: status,
              },
              [],
            );
        }

        async function softReconnect() {
          emitStatus("connecting");
          await new Promise((s) => setTimeout(s, 2_000));
          await run(true);
        }

        async function killAndClean(id: number, msg: string) {
          await killConnectionWA(id, props.accountId);
          emitStatus("close");
        }
        const socketIds = cacheAccountSocket.get(props.accountId)?.listSocket;

        ensureDirSync(pathDataBaseWA);

        const { state, saveCreds } = await useMultiFileAuthState(
          pathDataBaseWA + `/${props.connectionWhatsId}`,
        );

        if (!saveCreds) {
          const hash = ulid();
          cacheRootSocket.forEach((sockId) =>
            socketIo.to(sockId).emit(`geral-logs`, {
              hash,
              entity: "baileys",
              type: "ERROR",
              value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} | saveCreds no cliente da conexão não encontrado`,
            }),
          );
          await prisma.geralLogDate.create({
            data: {
              hash,
              entity: "baileys",
              type: "ERROR",
              value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} | saveCreds no cliente da conexão não encontrado`,
            },
          });
          return;
        }
        const baileysVersion = await fetchLatestBaileysVersion();
        const nameCon = await prisma.connectionWA.findFirst({
          where: { id: props.connectionWhatsId },
          select: { name: true },
        });
        if (!nameCon?.name) {
          const hash = ulid();
          cacheRootSocket.forEach((sockId) =>
            socketIo.to(sockId).emit(`geral-logs`, {
              hash,
              entity: "baileys",
              type: "ERROR",
              value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} | Erro ao recuperar o nome da conexão`,
            }),
          );
          await prisma.geralLogDate.create({
            data: {
              hash,
              entity: "baileys",
              type: "ERROR",
              value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} | Erro ao recuperar o nome da conexão`,
            },
          });
          console.error(
            "Erro ao recuperar o nome da conexão WhatsApp, verifique se a conexão existe.",
          );
          return;
        }

        const bot = makeWASocket({
          auth: state,
          version: baileysVersion.version,
          logger,
          defaultQueryTimeoutMs: undefined,
          qrTimeout: 1000 * 60 * 3,
          browser: Browsers.macOS("Chrome"),
          markOnlineOnConnect: true,
          cachedGroupMetadata: async (jid) => groupCache.get(jid),
          getMessage: async (key) => {
            const cacheKey = `${key.remoteJid}|${key.id}`;
            const env = messageCache.get<{ message: any }>(cacheKey);
            return env?.message;
          },
          patchMessageBeforeSending: async (msg, recipientJids) => {
            await bot.uploadPreKeysToServerIfRequired();
            return msg;
          },
        });

        sessionsBaileysWA.set(props.connectionWhatsId, bot);

        // bot.ev.on("group-participants.update", async (updates) => {
        //   const { id: groupJid, participants, action } = updates;
        //   const me = bot.user?.id.split(":")[0];

        //   switch (action) {
        //     case "demote":
        //     case "promote":
        //     case "add":
        //       break;

        //     case "remove":
        //       if (me && participants.includes(me)) {
        //         const getgroup = await prisma.connectionWAOnGroups.findFirst({
        //           where: { jid: groupJid },
        //           select: { id: true },
        //         });
        //         if (getgroup?.id) {
        //           await prisma.connectionWAOnGroups.delete({
        //             where: { id: getgroup.id },
        //           });
        //         }
        //         groupCache.del(groupJid);
        //       }
        //       break;
        //   }
        // });

        // bot.ev.on("groups.upsert", (metas) => {
        //   metas.forEach(async (g) => {
        //     const exist = await prisma.connectionWAOnGroups.findFirst({
        //       where: { connectionWAId: props.connectionWhatsId, jid: g.id },
        //       select: { id: true },
        //     });
        //     if (!exist) {
        //       await prisma.connectionWAOnGroups.create({
        //         data: {
        //           jid: g.id,
        //           name: g.subject,
        //           connectionWAId: props.connectionWhatsId,
        //         },
        //       });
        //     } else {
        //       await prisma.connectionWAOnGroups.update({
        //         where: { id: exist.id },
        //         data: { name: g.subject },
        //       });
        //     }
        //     groupCache.set(g.id, g);
        //   });
        // });

        // bot.ev.on("groups.update", async (updates) => {
        //   updates.forEach(async (u) => {
        //     if (u.subject && u.id) {
        //       const getGroup = await prisma.connectionWAOnGroups.findFirst({
        //         where: { jid: u.id },
        //         select: { id: true },
        //       });
        //       if (!getGroup?.id) {
        //         await prisma.connectionWAOnGroups.create({
        //           data: {
        //             jid: u.id,
        //             name: u.subject,
        //             connectionWAId: props.connectionWhatsId,
        //           },
        //         });
        //       } else {
        //         await prisma.connectionWAOnGroups.update({
        //           where: { id: getGroup.id },
        //           data: { name: u.subject },
        //         });
        //       }
        //     }
        //     if (u.id) groupCache.set(u.id, u);
        //   });
        // });

        bot.ev.on("groups.update", async ([event]) => {
          if (!bot?.ws || !bot.ws.isOpen) {
            return;
          }
          if (event?.id) {
            const metadata = await bot.groupMetadata(event.id);
            groupCache.set(event.id, metadata);
          }
        });

        bot.ev.on("group-participants.update", async (event) => {
          const metadata = await bot.groupMetadata(event.id);
          groupCache.set(event.id, metadata);
        });

        bot.ev.on(
          "connection.update",
          async ({ connection, lastDisconnect, qr }) => {
            if (connection) {
              cacheConnectionsWAOnline.set(
                props.connectionWhatsId,
                connection === "open",
              );
            }
            if (!!qr && !restart) {
              if (!!props.number) {
                const paircode = await bot.requestPairingCode(
                  props.number.replace(/\D/g, ""),
                );
                const code = paircode.split("");
                code.splice(4, 0, "-");
                webSocketEmitToRoom()
                  .account(props.accountId)
                  .emit(
                    `pairing-code-${props.connectionWhatsId}`,
                    code.join("").split("-"),
                    [],
                  );
              } else {
                webSocketEmitToRoom()
                  .account(props.accountId)
                  .emit(`qr-code-${props.connectionWhatsId}`, qr, []);
              }
            }

            if (connection) emitStatus(connection);

            const reason = new Boom(lastDisconnect?.error).output.statusCode;

            if (connection === "close") {
              switch (reason) {
                case DisconnectReason.badSession:
                  cacheConnectionsWAOnline.set(props.connectionWhatsId, false);
                  await NotificationApp({
                    accountId: props.accountId,
                    title_txt: "🚨🚨🚨",
                    body_txt: "Uma conexão caiu.",
                    onFilterSocket: () => [],
                    tag: "wa-close",
                  });
                  await killAndClean(
                    props.connectionWhatsId,
                    "Sessão corrompida - limpando credenciais.",
                  );
                  break;

                case DisconnectReason.connectionClosed:
                case DisconnectReason.connectionLost:
                case DisconnectReason.timedOut:
                case DisconnectReason.unavailableService:
                  cacheConnectionsWAOnline.set(props.connectionWhatsId, false);
                  if (attempts < (props.maxConnectionAttempts || 5)) {
                    attempts++;
                    await softReconnect();
                  }
                  break;

                case DisconnectReason.connectionReplaced:
                  cacheConnectionsWAOnline.set(props.connectionWhatsId, false);
                  await killAndClean(
                    props.connectionWhatsId,
                    "Sessão substituída em outro dispositivo.",
                  );
                  break;

                case DisconnectReason.loggedOut:
                  cacheConnectionsWAOnline.set(props.connectionWhatsId, false);
                  await killAndClean(
                    props.connectionWhatsId,
                    "Conta foi deslogada do WhatsApp.",
                  );
                  break;

                case DisconnectReason.restartRequired: {
                  cacheConnectionsWAOnline.set(props.connectionWhatsId, false);
                  await softReconnect();
                  break;
                }

                case DisconnectReason.forbidden:
                  cacheConnectionsWAOnline.set(props.connectionWhatsId, false);
                  emitStatus("close");
                  break;

                case 405:
                  cacheConnectionsWAOnline.set(props.connectionWhatsId, false);
                  await killAndClean(
                    props.connectionWhatsId,
                    "Sessão corrompida - limpando credenciais.",
                  );
                  break;

                default:
                  cacheConnectionsWAOnline.set(props.connectionWhatsId, false);
                  console.error("Motivo de desconexão não mapeado:", reason);
                  emitStatus("close");
              }
              return;
            }
            if (connection === "open") {
              const all = await bot.groupFetchAllParticipating();
              await Promise.all(
                Object.values(all).map((g) => bot.groupMetadata(g.id)),
              );
              attempts = 0;
              try {
                emitStatus("open");
                const number = bot.user?.id.split(":")[0];
                const { ConnectionConfig } = await prisma.connectionWA.update({
                  where: {
                    id: props.connectionWhatsId,
                    Business: { accountId: props.accountId },
                  },
                  data: { number },
                  select: { ConnectionConfig: true },
                });
                const cfg = ConnectionConfig;

                const tasks: Promise<unknown>[] = [];
                if (cfg?.profileName) {
                  tasks.push(bot.updateProfileName(cfg.profileName));
                } else {
                  await prisma.connectionConfig.upsert({
                    where: { connectionWAId: props.connectionWhatsId },
                    create: {
                      profileName: bot.user?.name,
                      connectionWAId: props.connectionWhatsId,
                    },
                    update: { profileName: bot.user?.name },
                  });
                }
                if (cfg?.fileNameImgPerfil) {
                  tasks.push(
                    bot.updateProfilePicture(`${number}@s.whatsapp.net`, {
                      url: resolve(
                        __dirname,
                        `../../../static/image/${cfg.fileNameImgPerfil}`,
                      ),
                    }),
                  );
                } else {
                  if (bot.user?.imgUrl) {
                    await prisma.connectionConfig.upsert({
                      where: { connectionWAId: props.connectionWhatsId },
                      create: {
                        fileNameImgPerfil: bot.user.imgUrl,
                        connectionWAId: props.connectionWhatsId,
                      },
                      update: { fileNameImgPerfil: bot.user.imgUrl },
                    });
                  }
                }
                if (cfg?.profileStatus) {
                  tasks.push(bot.updateProfileStatus(cfg.profileStatus));
                } else {
                  if (bot.user?.status) {
                    await prisma.connectionConfig.upsert({
                      where: { connectionWAId: props.connectionWhatsId },
                      create: {
                        profileStatus: bot.user.status,
                        connectionWAId: props.connectionWhatsId,
                      },
                      update: { profileStatus: bot.user.status },
                    });
                  }
                }
                const privacyConfig = await bot.fetchPrivacySettings();
                if (cfg?.lastSeenPrivacy) {
                  tasks.push(bot.updateLastSeenPrivacy(cfg.lastSeenPrivacy));
                } else {
                  await prisma.connectionConfig.upsert({
                    where: { connectionWAId: props.connectionWhatsId },
                    create: {
                      lastSeenPrivacy: privacyConfig.last as WAPrivacyValue,
                      connectionWAId: props.connectionWhatsId,
                    },
                    update: {
                      lastSeenPrivacy: privacyConfig.last as WAPrivacyValue,
                    },
                  });
                }
                if (cfg?.onlinePrivacy) {
                  tasks.push(bot.updateOnlinePrivacy(cfg.onlinePrivacy));
                } else {
                  await prisma.connectionConfig.upsert({
                    where: { connectionWAId: props.connectionWhatsId },
                    create: {
                      onlinePrivacy:
                        privacyConfig.online as WAPrivacyOnlineValue,
                      connectionWAId: props.connectionWhatsId,
                    },
                    update: {
                      onlinePrivacy:
                        privacyConfig.online as WAPrivacyOnlineValue,
                    },
                  });
                  // console.log("lastSeenPrivacy",await bot.last());
                }
                if (cfg?.readReceiptsPrivacy) {
                  tasks.push(
                    bot.updateReadReceiptsPrivacy(cfg.readReceiptsPrivacy),
                  );
                } else {
                  await prisma.connectionConfig.upsert({
                    where: { connectionWAId: props.connectionWhatsId },
                    create: {
                      readReceiptsPrivacy:
                        privacyConfig.readreceipts as WAReadReceiptsValue,
                      connectionWAId: props.connectionWhatsId,
                    },
                    update: {
                      readReceiptsPrivacy:
                        privacyConfig.readreceipts as WAReadReceiptsValue,
                    },
                  });
                }
                if (cfg?.statusPrivacy) {
                  tasks.push(bot.updateStatusPrivacy(cfg.statusPrivacy));
                } else {
                  await prisma.connectionConfig.upsert({
                    where: { connectionWAId: props.connectionWhatsId },
                    create: {
                      statusPrivacy: privacyConfig.status as WAPrivacyValue,
                      connectionWAId: props.connectionWhatsId,
                    },
                    update: {
                      statusPrivacy: privacyConfig.status as WAPrivacyValue,
                    },
                  });
                }
                if (cfg?.imgPerfilPrivacy) {
                  tasks.push(
                    bot.updateProfilePicturePrivacy(cfg.imgPerfilPrivacy),
                  );
                } else {
                  await prisma.connectionConfig.upsert({
                    where: { connectionWAId: props.connectionWhatsId },
                    create: {
                      imgPerfilPrivacy: privacyConfig.profile as WAPrivacyValue,
                      connectionWAId: props.connectionWhatsId,
                    },
                    update: {
                      imgPerfilPrivacy: privacyConfig.profile as WAPrivacyValue,
                    },
                  });
                }

                await Promise.allSettled(tasks);

                // await prisma.connectionWAOnGroups.deleteMany({
                //   where: { connectionWAId: props.connectionWhatsId },
                // });
                // const allGroups = await bot.groupFetchAllParticipating();
                // Object.values(allGroups).forEach((g) => groupCache.set(g.id, g));
                props.onConnection && props.onConnection(connection);
              } catch (error) {
                console.log("deu error");
                const hash = ulid();
                cacheRootSocket.forEach((sockId) =>
                  socketIo.to(sockId).emit(`geral-logs`, {
                    hash,
                    entity: "baileys",
                    type: "WARN",
                    value: `Conexão: #${props.connectionWhatsId} - Account: #${
                      props.accountId
                    } | Error tentando atualizar perfil da WA. >> ${JSON.stringify(
                      error,
                    )}`,
                  }),
                );
                await prisma.geralLogDate.create({
                  data: {
                    hash,
                    entity: "baileys",
                    type: "WARN",
                    value: `Conexão: #${props.connectionWhatsId} - Account: #${
                      props.accountId
                    } | Error tentando atualizar perfil da WA. >> ${JSON.stringify(
                      error,
                    )}`,
                  },
                });
                console.error("OPEN-handler error:", error);
              }
              res();
            }
          },
        );

        bot.ev.on("creds.update", async () => {
          try {
            await saveCreds();
          } catch (err: any) {
            console.error("Erro ao salvar credenciais:", err);
          }
        });

        bot.ev.on("messages.reaction", async (body) => {
          if (
            body[0].key.fromMe &&
            !body[0].reaction.key?.fromMe &&
            body[0].reaction.text
          ) {
            const msg = await prisma.messages.findFirst({
              where: { messageKey: body[0].key.id, by: "bot", type: "text" },
              select: {
                message: true,
                id: true,
                FlowState: {
                  where: { isFinish: false },
                  select: {
                    id: true,
                    flowId: true,
                    chatbotId: true,
                    campaignId: true,
                    ConnectionWA: {
                      select: { number: true, businessId: true },
                    },
                    ContactsWAOnAccount: {
                      select: {
                        id: true,
                        ContactsWA: { select: { completeNumber: true } },
                      },
                    },
                  },
                },
              },
            });
            if (
              !msg?.message ||
              !msg.FlowState?.flowId ||
              !msg.FlowState.ConnectionWA?.number ||
              !msg.FlowState.ContactsWAOnAccount?.ContactsWA.completeNumber
            ) {
              return;
            }

            const identifierLead = body[0].key.remoteJid;
            if (!identifierLead) {
              console.log("Deu erro para recuperar número do lead");
              return;
            }
            const { ContactsWAOnAccount, ...contactWA } =
              await prisma.contactsWA.upsert({
                where: {
                  completeNumber_page_id_channel: {
                    completeNumber: identifierLead,
                    channel: "whatsapp",
                    page_id: "whatsapp_default",
                  },
                },
                create: { completeNumber: identifierLead },
                update: {},
                select: {
                  id: true,
                  ContactsWAOnAccount: {
                    where: { accountId: props.accountId },
                    select: { id: true },
                  },
                },
              });

            if (!ContactsWAOnAccount.length) {
              const { id: newContact } =
                await prisma.contactsWAOnAccount.create({
                  data: {
                    name: "<unknown>",
                    accountId: props.accountId,
                    contactWAId: contactWA.id,
                  },
                  select: { id: true },
                });
              ContactsWAOnAccount.push({ id: newContact });
            }

            let flow:
              | { edges: any[]; nodes: any[]; businessIds: number[] }
              | undefined;
            flow = cacheFlowsMap.get(msg.FlowState?.flowId);
            if (!flow) {
              await mongo();
              const flowFetch = await ModelFlows.aggregate([
                {
                  $match: {
                    accountId: props.accountId,
                    _id: msg.FlowState.flowId,
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
              if (!flowFetch?.length) return console.log(`Flow not found. 1`);
              const { edges, nodes, businessIds } = flowFetch[0];
              flow = { edges, nodes, businessIds };
              cacheFlowsMap.set(msg.FlowState.flowId, flow);
            }

            const reactionNodes = flow.nodes.filter(
              (n: any) => n.type === "NodeListenReaction",
            ) as any[];

            if (!reactionNodes?.length) {
              console.log("Nenhum nó de reação encontrado no fluxo.");
              return;
            }

            const numberLead =
              msg.FlowState.ContactsWAOnAccount.ContactsWA.completeNumber;

            const keyMap = `${msg.FlowState.ConnectionWA.number}+${numberLead}`;
            const reactionsList = cachePendingReactionsList.get(keyMap) || [];
            cachePendingReactionsList.set(keyMap, [
              ...reactionsList,
              {
                message: msg.message,
                reactionText: body[0].reaction.text || "",
              },
            ]);

            const runningQueue = cacheRunningQueueReaction.get(keyMap);
            if (runningQueue) return;

            cacheRunningQueueReaction.set(keyMap, true);
            async function runReaction() {
              const reactionFresh = cachePendingReactionsList.get(keyMap);
              if (!reactionFresh?.length) {
                cacheRunningQueueReaction.set(keyMap, false);
                return;
              }
              const reaction = reactionFresh.shift();
              cachePendingReactionsList.set(keyMap, reactionFresh);
              if (!reaction) await runReaction();

              for (const reactionNode of reactionNodes) {
                const businessInfo = await prisma.connectionWA.findFirst({
                  where: { id: props.connectionWhatsId },
                  select: { Business: { select: { name: true } } },
                });
                if (!businessInfo) {
                  console.log("Connection not found");
                  return;
                }

                await NodeControler({
                  forceFinish: true,
                  businessName: businessInfo.Business.name,
                  flowId: msg!.FlowState!.flowId!,
                  flowBusinessIds: flow!.businessIds,
                  type: "running",
                  action: null,
                  external_adapter: {
                    clientWA: bot,
                    type: "baileys",
                  },
                  businessId: msg!.FlowState!.ConnectionWA!.businessId,
                  chatbotId: msg!.FlowState!.chatbotId || undefined,
                  campaignId: msg!.FlowState!.campaignId || undefined,
                  oldNodeId: reactionNode.id,
                  currentNodeId: reactionNode.id,
                  isSavePositionLead: false,
                  flowStateId: msg!.FlowState!.id,
                  contactAccountId: msg!.FlowState!.ContactsWAOnAccount!.id,
                  lead_id: numberLead,
                  edges: flow!.edges,
                  nodes: flow!.nodes,
                  contactsWAOnAccountReactionId: ContactsWAOnAccount[0].id,
                  connectionId: props.connectionWhatsId,
                  ...reaction!,
                  accountId: props.accountId,
                  actions: {
                    onFinish: async (vl) => {
                      runReaction();
                    },
                    onErrorClient: async (err) => {
                      console.error("Erro no cliente", err);
                      cacheRunningQueueReaction.set(keyMap, false);
                      cachePendingReactionsList.delete(keyMap);
                      // isso aqui NÃO PODE ACONTECER.
                      // caso acontece como vamos voltar a executar a reação?
                      return;
                    },
                    onErrorNumber: async () => {
                      console.error(
                        "Erro no número do contato",
                        identifierLead,
                      );
                      cacheRunningQueueReaction.set(keyMap, false);
                      cachePendingReactionsList.delete(keyMap);
                      return;
                    },
                  },
                });
              }
            }
            await runReaction();
          }
        });

        bot.ev.on("messages.upsert", async (body) => {
          for (const m of body.messages) {
            if (m.message?.protocolMessage?.historySyncNotification) continue;

            if (m.message && !m.message.protocolMessage) {
              const key = m.key;
              const identifierLead = key.remoteJid;
              const fromMe = key.fromMe;
              const isGroup = !!identifierLead?.includes("@g.us");
              const numberConnection = bot.user?.id.split(":")[0];

              if (!identifierLead || !numberConnection) continue;

              // ====== 1. Caso de mensagens enviadas por nós (append) ======
              if (!isGroup && fromMe && body.type === "append") {
                const msgId = key.id;

                try {
                  const findMessage = await prisma.messages.findFirstOrThrow({
                    where: { messageKey: msgId },
                    select: { id: true },
                  });
                  await prisma.messages.update({
                    where: { id: findMessage.id },
                    data: { status: "DELIVERED" },
                    select: { id: true },
                  });
                  const ticket = await prisma.tickets.findFirst({
                    where: {
                      ContactsWAOnAccount: {
                        ContactsWA: { completeNumber: identifierLead },
                      },
                      connectionWAId: props.connectionWhatsId,
                    },
                    select: {
                      InboxDepartment: { select: { businessId: true } },
                      id: true,
                    },
                  });
                  if (ticket) {
                    webSocketEmitToRoom()
                      .account(props.accountId)
                      .ticket_chat(ticket.id)
                      .message_eco(
                        {
                          id: findMessage.id,
                        },
                        [],
                      );
                  }
                } catch (error) {
                  // não achou a mensagem;
                }
                continue;
              }

              // ====== 2. Novas mensagens recebidas em tempo real ======
              if (body.type === "notify" && !fromMe && !isGroup) {
                const incoming = m.message;
                const hasReaction = !!incoming?.reactionMessage;
                const hasReactionsList = !!m.reactions?.length;
                if (hasReaction || hasReactionsList) continue;
                await mongo();

                const keyMapLeadAwaiting = `${props.connectionWhatsId}+${identifierLead}`;
                // await bot.readMessages(body.messages.map((m) => m.key));
                // console.log({ audio: m.message?.audioMessage?.url });

                const isAudioMessage = !!m.message?.audioMessage?.url;
                const isImageMessage = !!m.message?.imageMessage;
                const isDocumentMessage = !!m.message?.documentMessage;
                const isVideoMessage = !!m.message?.videoMessage;
                const contactMessage = m.message?.contactMessage?.vcard;
                // const isArrayContactMessage =
                //   m.message?.contactsArrayMessage?.contacts?.length;
                const locationMessage = m.message?.locationMessage;

                const messageText =
                  m.message?.extendedTextMessage?.text ??
                  m.message?.conversation;

                const profilePicUrl = await bot
                  .profilePictureUrl(identifierLead)
                  .then((s) => s)
                  .catch(() => undefined);

                const { ContactsWAOnAccount, ...contactWA } =
                  await prisma.contactsWA.upsert({
                    where: {
                      completeNumber_page_id_channel: {
                        completeNumber: identifierLead,
                        channel: "whatsapp",
                        page_id: "whatsapp_default",
                      },
                    },
                    create: {
                      img: profilePicUrl,
                      completeNumber: identifierLead,
                      page_id: "whatsapp_default",
                      channel: "whatsapp",
                      ContactsWAOnAccount: {
                        create: {
                          accountId: props.accountId,
                          name: m.pushName ?? "SEM NOME",
                        },
                      },
                    },
                    update: { img: profilePicUrl },
                    select: {
                      id: true,
                      ContactsWAOnAccount: {
                        where: { accountId: props.accountId },
                        select: { id: true },
                      },
                    },
                  });

                if (!ContactsWAOnAccount.length) {
                  const { id } = await prisma.contactsWAOnAccount.create({
                    data: {
                      name: m.pushName ?? "SEM NOME",
                      accountId: props.accountId,
                      contactWAId: contactWA.id,
                    },
                    select: { id: true },
                  });
                  ContactsWAOnAccount.push({ id });
                }

                // Verifica se o lead está aguardando processamento
                if (leadAwaiting.get(keyMapLeadAwaiting)) {
                  console.log("EM PROCESSAMENTO!");
                  continue;
                }

                const messageAudio = m.message?.audioMessage;
                const messageImage = m.message?.imageMessage;
                const messageVideo = m.message?.videoMessage?.url;
                const capitionImage = m.message?.imageMessage?.caption;

                const doc = m.message?.documentMessage;
                const docWithCaption =
                  m.message?.documentWithCaptionMessage?.message
                    ?.documentMessage;

                const ticket = await prisma.tickets.findFirst({
                  where: {
                    status: { in: ["OPEN", "NEW"] },
                    ContactsWAOnAccount: {
                      ContactsWA: { completeNumber: identifierLead },
                    },
                    ConnectionWA: { number: numberConnection },
                  },
                  select: {
                    accountId: true,
                    protocol: true,
                    InboxDepartment: {
                      select: { businessId: true, id: true, name: true },
                    },
                    id: true,
                    inboxUserId: true,
                    status: true,
                    ContactsWAOnAccount: { select: { name: true } },
                  },
                });
                if (ticket) {
                  if (!!messageText) {
                    const isValidText = messageText.trim().length > 0;
                    if (!isValidText) {
                      console.log("Mensagem de texto inválida ou vazia.");
                      continue;
                    }
                  }
                  let fileName = "";
                  let fileNameOriginal = "";
                  if (messageAudio) {
                    const ext = mime.extension(
                      messageAudio.mimetype || "audio/mpeg",
                    );
                    fileName = `image_inbox_${Date.now()}.${ext}`;
                    try {
                      const buffer = await downloadMediaMessage(
                        m,
                        "buffer",
                        {},
                      );
                      writeFileSync(
                        pathStatic + `/${fileName}`,
                        new Uint8Array(buffer),
                      );
                      leadAwaiting.set(keyMapLeadAwaiting, false);
                    } catch (error) {
                      const hash = ulid();
                      cacheRootSocket.forEach((sockId) =>
                        socketIo.to(sockId).emit(`geral-logs`, {
                          hash,
                          entity: "baileys",
                          type: "WARN",
                          value: `Conexão: #${
                            props.connectionWhatsId
                          } - Account: #${
                            props.accountId
                          } | Error ao tentar salvar AUDIO recebido, line: 934. >> ${JSON.stringify(
                            error,
                          )}`,
                        }),
                      );
                      await prisma.geralLogDate.create({
                        data: {
                          hash,
                          entity: "baileys",
                          type: "WARN",
                          value: `Conexão: #${
                            props.connectionWhatsId
                          } - Account: #${
                            props.accountId
                          } | Error ao tentar salvar AUDIO recebido, line: 934. >> ${JSON.stringify(
                            error,
                          )}`,
                        },
                      });
                      console.log(error);
                    }
                  }
                  if (messageImage) {
                    const ext = mime.extension(
                      messageImage.mimetype || "image/jpeg",
                    );
                    fileName = `image_inbox_${Date.now()}.${ext}`;
                    try {
                      const buffer = await downloadMediaMessage(
                        m,
                        "buffer",
                        {},
                      );

                      await writeFile(
                        pathStatic + `/${fileName}`,
                        new Uint8Array(buffer),
                      );
                    } catch (error) {
                      const hash = ulid();
                      cacheRootSocket.forEach((sockId) =>
                        socketIo.to(sockId).emit(`geral-logs`, {
                          hash,
                          entity: "baileys",
                          type: "WARN",
                          value: `Conexão: #${
                            props.connectionWhatsId
                          } - Account: #${
                            props.accountId
                          } | Error ao tentar salvar IMAGEM recebido >> ${JSON.stringify(
                            error,
                          )}`,
                        }),
                      );
                      await prisma.geralLogDate.create({
                        data: {
                          hash,
                          entity: "baileys",
                          type: "WARN",
                          value: `Conexão: #${
                            props.connectionWhatsId
                          } - Account: #${
                            props.accountId
                          } | Error ao tentar salvar IMAGEM recebido >> ${JSON.stringify(
                            error,
                          )}`,
                        },
                      });
                      console.log(error);
                    }
                  }
                  if (doc) {
                    const ext = mime.extension(
                      doc?.mimetype || "text/html; charset=utf-8",
                    );
                    fileName = `file_inbox_${Date.now()}.${ext}`;
                    fileNameOriginal = doc.fileName || "";
                    try {
                      const buffer = await downloadMediaMessage(
                        m,
                        "buffer",
                        {},
                      );
                      if (!buffer || buffer.length === 0) {
                        console.log("Buffer de mídia vazio.");
                        continue;
                      }
                      await writeFile(
                        pathStatic + `/${fileName}`,
                        new Uint8Array(buffer),
                      );
                    } catch (error) {
                      const hash = ulid();
                      cacheRootSocket.forEach((sockId) =>
                        socketIo.to(sockId).emit(`geral-logs`, {
                          hash,
                          entity: "baileys",
                          type: "WARN",
                          value: `Conexão: #${
                            props.connectionWhatsId
                          } - Account: #${
                            props.accountId
                          } | Error ao tentar salvar FILE recebido >> ${JSON.stringify(
                            error,
                          )}`,
                        }),
                      );
                      await prisma.geralLogDate.create({
                        data: {
                          hash,
                          entity: "baileys",
                          type: "WARN",
                          value: `Conexão: #${
                            props.connectionWhatsId
                          } - Account: #${
                            props.accountId
                          } | Error ao tentar salvar FILE recebido >> ${JSON.stringify(
                            error,
                          )}`,
                        },
                      });
                      console.log(error);
                    }
                  }
                  if (docWithCaption) {
                    const ext = mime.extension(
                      doc?.mimetype || "text/html; charset=utf-8",
                    );
                    fileName = `file_inbox_${Date.now()}.${ext}`;
                    fileNameOriginal = docWithCaption.fileName || "";
                    try {
                      const buffer = await downloadMediaMessage(
                        m,
                        "buffer",
                        {},
                      );
                      if (!buffer || buffer.length === 0) {
                        console.log("Buffer de mídia vazio.");
                        continue;
                      }
                      await writeFile(
                        pathStatic + `/${fileName}`,
                        new Uint8Array(buffer),
                      );
                    } catch (error) {
                      const hash = ulid();
                      cacheRootSocket.forEach((sockId) =>
                        socketIo.to(sockId).emit(`geral-logs`, {
                          hash,
                          entity: "baileys",
                          type: "WARN",
                          value: `Conexão: #${
                            props.connectionWhatsId
                          } - Account: #${
                            props.accountId
                          } | Error ao tentar salvar FILE-COM-CAPTION recebido >> ${JSON.stringify(
                            error,
                          )}`,
                        }),
                      );
                      await prisma.geralLogDate.create({
                        data: {
                          hash,
                          entity: "baileys",
                          type: "WARN",
                          value: `Conexão: #${
                            props.connectionWhatsId
                          } - Account: #${
                            props.accountId
                          } | Error ao tentar salvar FILE-COM-CAPTION recebido >> ${JSON.stringify(
                            error,
                          )}`,
                        },
                      });
                      console.log(error);
                    }
                  }

                  //   const objectVcard = {};
                  //   if (contactMessage) {
                  //     contactMessage.split("\n").forEach((item) => {
                  //       if (/waid=(\d*)/.test(item)) {
                  //         Object.assign(objectVcard, {
                  //           number: item.match(/waid=(\d*)/)?.[1],
                  //         });
                  //         return;
                  //       }
                  //       if (/FN:(.*)/.test(item)) {
                  //         Object.assign(objectVcard, {
                  //           fullName: item.match(/FN:(.*)/)?.[1],
                  //         });
                  //         return;
                  //       }
                  //     });
                  //   }

                  //   verificar se o atendente esta na pagina do ticket;

                  let isCurrentTicket = false;
                  if (!ticket.inboxUserId) {
                    // é o account que esta no socket
                    //   const user = CacheStateUserSocket.get(ticket.sectorsAttendantsId);
                    //   isCurrentTicket = user?.currentTicket === ticket.id;
                    const user = cacheAccountSocket.get(props.accountId);
                    if (user)
                      isCurrentTicket = user.currentTicket === ticket.id;
                  }

                  const msg = await prisma.messages.create({
                    data: {
                      ticketsId: ticket.id,
                      message: "",
                      type: "text",
                      ...(messageText && {
                        type: "text",
                        message: messageText,
                      }),
                      ...(messageAudio && { type: "audio", fileName }),
                      ...(messageImage && {
                        type: "image",
                        fileName: fileName,
                        ...(messageImage.caption && {
                          caption: messageImage.caption,
                        }),
                      }),
                      ...(doc && {
                        type: "file",
                        fileName: fileName,
                        fileNameOriginal,
                        ...(doc.caption && { caption: doc.caption }),
                      }),
                      ...(docWithCaption && {
                        type: "file",
                        fileName: fileName,
                        fileNameOriginal,
                        ...(docWithCaption.caption && {
                          caption: docWithCaption.caption,
                        }),
                      }),
                      // ...(contactMessage && { type: "contact", ...objectVcard }),
                      // ...(locationMessage && {
                      //   type: "location",
                      //   degreesLatitude: String(locationMessage.degreesLatitude!),
                      //   degreesLongitude: String(locationMessage.degreesLongitude!),
                      //   address: locationMessage.address ?? "",
                      //   name: locationMessage.name ?? "",
                      // }),
                      by: "contact",
                      messageKey: m.key.id,
                      read: isCurrentTicket,
                      status: "DELIVERED",
                    },
                    select: { createAt: true, id: true },
                  });

                  await NotificationApp({
                    accountId: props.accountId,
                    title_txt: `${ticket.ContactsWAOnAccount.name}`,
                    title_html: `${ticket.ContactsWAOnAccount.name}`,
                    tag: `msg-ticket-${ticket.id}`,
                    body_txt: !messageText
                      ? `🎤📷 arquivo de mídia`
                      : messageText.slice(0, 24),

                    body_html: `<span className="font-medium text-sm line-clamp-1">
${!messageText ? `🎤📷 arquivo de mídia` : messageText.slice(0, 24)}
</span> 
<span className="text-xs font-light">${ticket.ContactsWAOnAccount.name}</span>`,
                    url_redirect: `$self/?open_ticket=${ticket.id}&bId=${ticket.InboxDepartment.businessId}&name=${ticket.ContactsWAOnAccount.name}`,
                    onFilterSocket(sockets) {
                      return sockets
                        .filter(
                          (s) =>
                            s.focused !== `modal-player-chat-${ticket.id}` ||
                            s.focused !== `modal-player-only-chat-${ticket.id}`,
                        )
                        .map((s) => s.id);
                    },
                  });

                  const { ticket_chat, player_department } =
                    webSocketEmitToRoom().account(props.accountId);

                  player_department(
                    ticket.InboxDepartment.id,
                  ).message_ticket_list(
                    // @ts-expect-error
                    {
                      createAt: msg.createAt,
                      status: "DELIVERED",
                      by: "contact",
                      ticketId: ticket.id,
                      ...(messageAudio && { type: "audio" }),
                      ...(messageImage && { type: "image" }),
                      ...((doc || docWithCaption) && { type: "file" }),
                      ...(messageText && { type: "text", text: messageText }),
                    },
                    [],
                  );

                  ticket_chat(ticket.id).message(
                    {
                      content: {
                        ...msg,
                        ...(messageText && { type: "text", text: messageText }),
                        ...(messageAudio && {
                          type: "audio",
                          fileName,
                          ptt: messageAudio.ptt,
                        }),
                        ...(messageImage && {
                          type: "image",
                          fileName,
                          ...(messageImage.caption && {
                            caption: messageImage?.caption,
                          }),
                        }),
                        ...(doc && {
                          type: "file",
                          fileName: fileName,
                          fileNameOriginal,
                          ...(doc.caption && { caption: doc.caption }),
                        }),
                        ...(docWithCaption && {
                          type: "file",
                          fileName: fileName,
                          fileNameOriginal,
                          ...(docWithCaption.caption && {
                            caption: docWithCaption.caption,
                          }),
                        }),
                      },
                      by: "contact",
                      departmentId: ticket.InboxDepartment.id,
                      notifyMsc: !isCurrentTicket, // quem controla a notificação é a função NotificationApp
                      userId: ticket.inboxUserId, // caso seja enviado para um usuário.
                      lastInteractionDate: msg.createAt,
                    },
                    [],
                  );

                  //   businessSpace.emit("synchronize-message", {
                  //     ticketId: ticket.id,
                  //     ...(ticket.sectorsAttendantsId && {
                  //       userId: ticket.sectorsAttendantsId,
                  //     }),
                  //     data: {
                  //       clear: false,
                  //       ...(messageAudio && { type: "audio", fileName: filenameAudio }),
                  //       ...(messageImage && {
                  //         type: "image",
                  //         fileName: filenameImg,
                  //         caption: capitionImage,
                  //       }),
                  //       ...(messageText && {
                  //         type: "text",
                  //         message: messageText,
                  //       }),
                  //       ...(contactMessage && { type: "contact", ...objectVcard }),
                  //       ...(locationMessage && {
                  //         type: "location",
                  //         degreesLatitude: locationMessage.degreesLatitude,
                  //         degreesLongitude: locationMessage.degreesLongitude,
                  //         address: locationMessage.address ?? "",
                  //         name: locationMessage.name ?? "",
                  //       }),
                  //       ...((doc || docWithCaption) && {
                  //         type: "file",
                  //         fileName: nameFileWithExt,
                  //         caption: docWithCaption?.caption ?? "",
                  //       }),
                  //       createAt: moment(mess.createAt)
                  //         .tz("America/Sao_Paulo")
                  //         .toDate(),
                  //       id: mess.id,
                  //       read: isCurrentTicket,
                  //       sentBy: "lead",
                  //     },
                  //   } as PropsSynchronizeTicketMessageHumanService);

                  //   leadAwaiting.set(keyMapLeadAwaiting, false);
                  continue;
                }

                const chatbot = await prisma.chatbot.findFirst({
                  where: {
                    connectionWAId: props.connectionWhatsId,
                    accountId: props.accountId,
                    status: true,
                  },
                  select: {
                    id: true,
                    flowId: true,
                    fallback: true,
                    addToLeadTagsIds: true,
                    addLeadToAudiencesIds: true,
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

                if (chatbot) {
                  let currentIndexNodeLead = await prisma.flowState.findFirst({
                    where: {
                      connectionWAId: props.connectionWhatsId,
                      contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                      isFinish: false,
                    },
                    select: {
                      indexNode: true,
                      id: true,
                      previous_response_id: true,
                    },
                  });
                  if (!currentIndexNodeLead) {
                    currentIndexNodeLead = await prisma.flowState.create({
                      data: {
                        connectionWAId: props.connectionWhatsId,
                        contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                        indexNode: "0",
                        flowId: chatbot.flowId,
                        chatbotId: chatbot.id,
                      },
                      select: {
                        indexNode: true,
                        id: true,
                        previous_response_id: true,
                      },
                    });
                    webSocketEmitToRoom()
                      .account(props.accountId)
                      .dashboard.dashboard_services({
                        delta: +1,
                        hour: resolveHourAndMinute(),
                      });
                  }

                  if (!messageText && !messageAudio) {
                    const isSendMessageSuportText =
                      cacheSendMessageSuportText.get(keyMapLeadAwaiting);

                    if (!isSendMessageSuportText) {
                      await prisma.messages.create({
                        data: {
                          by: "contact",
                          message: "<Enviou mídia>",
                          type: "text",
                          messageKey: m.key.id,
                          status: "DELIVERED",
                          flowStateId: currentIndexNodeLead.id,
                        },
                      });

                      const msg = await SendMessageText({
                        connectionId: props.connectionWhatsId,
                        text: "*Mensagem automática*\nEste chat oferece suporte a mensagens de texto ou áudio.",
                        toNumber: identifierLead,
                        quoted: m,
                      });

                      if (msg?.key?.id) {
                        await prisma.messages.create({
                          data: {
                            by: "system",
                            message:
                              "*Mensagem automática*\nEste chat oferece suporte a mensagens de texto ou áudio.",
                            type: "text",
                            messageKey: msg.key.id,
                            flowStateId: currentIndexNodeLead.id,
                          },
                        });
                      }
                    }
                    continue;
                  }
                  cacheSendMessageSuportText.delete(keyMapLeadAwaiting);

                  const isToRestartChatbot = chatbotRestartInDate.get(
                    `${numberConnection}+${identifierLead}`,
                  );
                  if (!!isToRestartChatbot) {
                    const isbefore = moment()
                      .tz("America/Sao_Paulo")
                      .isBefore(isToRestartChatbot);
                    console.log({ isbefore });
                    if (isbefore) {
                      continue;
                    } else {
                      chatbotRestartInDate.delete(
                        `${numberConnection}+${identifierLead}`,
                      );
                    }
                  }

                  if (chatbot.addToLeadTagsIds.length) {
                    const tags = await prisma.tag.findMany({
                      where: { id: { in: chatbot.addToLeadTagsIds } },
                      select: { id: true },
                    });
                    for await (const { id } of tags) {
                      const isExist =
                        await prisma.tagOnContactsWAOnAccount.findFirst({
                          where: {
                            contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                            tagId: id,
                          },
                        });
                      if (!isExist) {
                        await prisma.tagOnContactsWAOnAccount.create({
                          data: {
                            contactsWAOnAccountId: ContactsWAOnAccount[0].id,
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
                                accountId: props.accountId,
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
                            const hash = ulid();
                            cacheRootSocket.forEach((sockId) =>
                              socketIo.to(sockId).emit(`geral-logs`, {
                                hash,
                                entity: "flows",
                                type: "WARN",
                                value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - flow: #${chatbot.flowId} | Not found`,
                              }),
                            );
                            await prisma.geralLogDate.create({
                              data: {
                                hash,
                                entity: "flows",
                                type: "WARN",
                                value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - flow: #${chatbot.flowId} | Not found`,
                              },
                            });
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
                                accountId: props.accountId,
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
                            const hash = ulid();
                            cacheRootSocket.forEach((sockId) =>
                              socketIo.to(sockId).emit(`geral-logs`, {
                                hash,
                                entity: "flows",
                                type: "WARN",
                                value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - flow: #${chatbot.flowId} | Not found`,
                              }),
                            );
                            await prisma.geralLogDate.create({
                              data: {
                                hash,
                                entity: "flows",
                                type: "WARN",
                                value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - flow: #${chatbot.flowId} | Not found`,
                              },
                            });
                            return console.log(`Flow not found. 3`);
                          }
                          const { edges, nodes, businessIds } = flowFetch[0];
                          flow = { edges, nodes, businessIds };
                          cacheFlowsMap.set(chatbot.flowId, flow);
                        }
                      }

                      if (!flow) {
                        const hash = ulid();
                        cacheRootSocket.forEach((sockId) =>
                          socketIo.to(sockId).emit(`geral-logs`, {
                            hash,
                            entity: "flows",
                            type: "WARN",
                            value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - flow: #${chatbot.flowId} | Not found`,
                          }),
                        );
                        await prisma.geralLogDate.create({
                          data: {
                            hash,
                            entity: "flows",
                            type: "WARN",
                            value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - flow: #${chatbot.flowId} | Not found`,
                          },
                        });
                        return console.log(`Flow não encontrado.`);
                      }

                      const businessInfo = await prisma.connectionWA.findFirst({
                        where: { id: props.connectionWhatsId },
                        select: { Business: { select: { name: true } } },
                      });
                      if (!businessInfo) {
                        console.log("Connection not found");
                        const hash = ulid();
                        cacheRootSocket.forEach((sockId) =>
                          socketIo.to(sockId).emit(`geral-logs`, {
                            hash,
                            entity: "connectionWA",
                            type: "WARN",
                            value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} | Tentou buscar o nome do projeto pela tabela de conexão`,
                          }),
                        );
                        await prisma.geralLogDate.create({
                          data: {
                            hash,
                            entity: "connectionWA",
                            type: "WARN",
                            value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} | Tentou buscar o nome do projeto pela tabela de conexão`,
                          },
                        });
                        return;
                      }

                      let audioFilePath = "";
                      if (messageAudio) {
                        const durationSeconds = messageAudio.seconds || 0;
                        if (!durationSeconds) {
                          await prisma.messages.create({
                            data: {
                              by: "system",
                              message:
                                "Log: Duração não disponível. Ignorando por segurança.",
                              type: "text",
                              flowStateId: currentIndexNodeLead.id,
                            },
                          });
                          return;
                        }
                        const durationMinutes = durationSeconds / 60;
                        const maxDuration = Math.floor(6 * 1.3);
                        if (durationMinutes > maxDuration) {
                          const msg = await SendMessageText({
                            connectionId: props.connectionWhatsId,
                            text: `*Mensagem automática*\nO áudio enviado excedeu o limite máximo permitido(${maxDuration}min).`,
                            toNumber: identifierLead,
                            quoted: m,
                          });

                          if (msg?.key?.id) {
                            await prisma.messages.create({
                              data: {
                                by: "system",
                                message: `*Mensagem automática*\nO áudio enviado excedeu o limite máximo permitido(${maxDuration}min).`,
                                type: "text",
                                messageKey: msg.key.id,
                                flowStateId: currentIndexNodeLead.id,
                              },
                            });
                          }
                          return;
                        }

                        try {
                          const originalBufferAudio =
                            (await downloadMediaMessage(
                              m,
                              "buffer",
                              {},
                            )) as Buffer;
                          const tempPath =
                            await handleFileTemp.saveBuffer(
                              originalBufferAudio,
                            );
                          audioFilePath = tempPath;
                        } catch (error) {
                          const hash = ulid();
                          cacheRootSocket.forEach((sockId) =>
                            socketIo.to(sockId).emit(`geral-logs`, {
                              hash,
                              entity: "baileys",
                              type: "WARN",
                              value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} | Error ao tentar salvar AUDIO recebido no chatbot`,
                            }),
                          );
                          await prisma.geralLogDate.create({
                            data: {
                              hash,
                              entity: "baileys",
                              type: "WARN",
                              value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} | Error ao tentar salvar AUDIO recebido no chatbot`,
                            },
                          });
                          console.log(error);
                        }
                      }

                      await NodeControler({
                        businessName: chatbot.Business.name,
                        flowId: chatbot.flowId,
                        flowBusinessIds: flow.businessIds,
                        type: "running",
                        businessId: chatbot.Business.id,
                        audioPath: audioFilePath,
                        connectionId: props.connectionWhatsId,
                        chatbotId: chatbot.id,
                        oldNodeId: currentIndexNodeLead?.indexNode || "0",
                        previous_response_id:
                          currentIndexNodeLead.previous_response_id ||
                          undefined,
                        external_adapter: {
                          type: "baileys",
                          clientWA: bot,
                        },
                        isSavePositionLead: true,
                        flowStateId: currentIndexNodeLead.id,
                        contactAccountId: ContactsWAOnAccount[0].id,
                        lead_id: identifierLead,
                        currentNodeId: currentIndexNodeLead?.indexNode || "0",
                        edges: flow.edges,
                        nodes: flow.nodes,
                        message: messageText ?? "",
                        accountId: props.accountId,
                        action: null,
                        actions: {
                          onErrorClient: async (vl) => {
                            if (currentIndexNodeLead) {
                              const scheduleExecutionCache =
                                scheduleExecutionsReply.get(
                                  numberConnection +
                                    "@s.whatsapp.net" +
                                    m.key.remoteJid!,
                                );
                              if (scheduleExecutionCache) {
                                scheduleExecutionCache.cancel();
                              }
                              console.log("TA CAINDO AQUI, finalizando fluxo");
                              await prisma.flowState.update({
                                where: { id: currentIndexNodeLead.id },
                                data: {
                                  isFinish: true,
                                  finishedAt: new Date(),
                                },
                              });

                              webSocketEmitToRoom()
                                .account(props.accountId)
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
                                chatbotRestartInDate.set(
                                  `${numberConnection}+${identifierLead}`,
                                  nextDate,
                                );
                              }
                            }
                          },
                          onFinish: async (vl) => {
                            if (currentIndexNodeLead) {
                              const scheduleExecutionCache =
                                scheduleExecutionsReply.get(
                                  numberConnection +
                                    "@s.whatsapp.net" +
                                    m.key.remoteJid!,
                                );
                              if (scheduleExecutionCache) {
                                scheduleExecutionCache.cancel();
                              }
                              console.log("TA CAINDO AQUI, finalizando fluxo");
                              await prisma.flowState.update({
                                where: { id: currentIndexNodeLead.id },
                                data: {
                                  isFinish: true,
                                  finishedAt: new Date(),
                                },
                              });
                              webSocketEmitToRoom()
                                .account(props.accountId)
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
                                chatbotRestartInDate.set(
                                  `${numberConnection}+${identifierLead}`,
                                  nextDate,
                                );
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
                                const hash = ulid();
                                cacheRootSocket.forEach((sockId) =>
                                  socketIo.to(sockId).emit(`geral-logs`, {
                                    hash,
                                    entity: "flowState",
                                    type: "WARN",
                                    value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - flowState: #${currentIndexNodeLead.id} | Error ao atualizar flowState`,
                                  }),
                                );
                                await prisma.geralLogDate.create({
                                  data: {
                                    hash,
                                    entity: "flowState",
                                    type: "WARN",
                                    value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - flowState: #${currentIndexNodeLead.id} | Error ao atualizar flowState`,
                                  },
                                });
                                console.log("Error ao atualizar flowState!");
                              }
                            }
                          },
                          onEnterNode: async (node) => {
                            const indexCurrentAlreadyExist =
                              await prisma.flowState.findFirst({
                                where: {
                                  connectionWAId: props.connectionWhatsId,
                                  contactsWAOnAccountId:
                                    ContactsWAOnAccount[0].id,
                                },
                                select: { id: true },
                              });
                            if (!indexCurrentAlreadyExist) {
                              await prisma.flowState.create({
                                data: {
                                  indexNode: node.id,
                                  flowId: node.flowId,
                                  connectionWAId: props.connectionWhatsId,
                                  contactsWAOnAccountId:
                                    ContactsWAOnAccount[0].id,
                                },
                              });
                              webSocketEmitToRoom()
                                .account(props.accountId)
                                .dashboard.dashboard_services({
                                  delta: +1,
                                  hour: resolveHourAndMinute(),
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
                        leadAwaiting.set(keyMapLeadAwaiting, false);
                      });
                    };

                    if (!chatbot.OperatingDays.length) {
                      await validMsgChatbot();
                      continue;
                    }

                    const nowTime = moment().tz("America/Sao_Paulo");
                    const dayOfWeek = nowTime.get("weekday");

                    const validTime = chatbot.OperatingDays.some((day) => {
                      if (day.dayOfWeek === dayOfWeek) {
                        if (day.WorkingTimes?.length) {
                          const valid = day.WorkingTimes.some(
                            ({ end, start }) => {
                              const isbet = nowTime.isBetween(
                                getTimeBR(start),
                                getTimeBR(end),
                              );
                              console.log({ isbet, end, start, nowTime });
                              return isbet;
                            },
                          );
                          return valid;
                        } else {
                          return true;
                        }
                      }
                    });

                    if (!validTime) {
                      if (chatbot.fallback) {
                        const flowState = await prisma.flowState.findFirst({
                          where: {
                            connectionWAId: props.connectionWhatsId,
                            contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                            isFinish: false,
                          },
                          select: { id: true, fallbackSent: true },
                        });
                        if (!flowState) {
                          await new Promise((resolve) =>
                            setTimeout(resolve, 1000 * 4),
                          );
                          await TypingDelay({
                            connectionId: props.connectionWhatsId,
                            toNumber: identifierLead + "@s.whatsapp.net",
                            delay: CalculeTypingDelay(chatbot.fallback),
                          });
                          await SendMessageText({
                            connectionId: props.connectionWhatsId,
                            text: chatbot.fallback,
                            toNumber: identifierLead + "@s.whatsapp.net",
                          });
                          await prisma.flowState.create({
                            data: {
                              connectionWAId: props.connectionWhatsId,
                              contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                              indexNode: "0",
                              flowId: chatbot.flowId,
                              fallbackSent: true,
                            },
                            select: { id: true },
                          });
                          webSocketEmitToRoom()
                            .account(props.accountId)
                            .dashboard.dashboard_services({
                              delta: +1,
                              hour: resolveHourAndMinute(),
                            });
                        } else {
                          if (!flowState.fallbackSent) {
                            await new Promise((resolve) =>
                              setTimeout(resolve, 1000 * 4),
                            );
                            await TypingDelay({
                              connectionId: props.connectionWhatsId,
                              toNumber: identifierLead + "@s.whatsapp.net",
                              delay: CalculeTypingDelay(chatbot.fallback),
                            });
                            await SendMessageText({
                              connectionId: props.connectionWhatsId,
                              text: chatbot.fallback,
                              toNumber: identifierLead + "@s.whatsapp.net",
                            });
                            await prisma.flowState.update({
                              where: { id: flowState.id },
                              data: { fallbackSent: true },
                            });
                          }
                        }
                      }

                      const minutesToNextExecutionInQueue = Math.min(
                        ...chatbot.OperatingDays.map((day) => {
                          const nowDate = moment().tz("America/Sao_Paulo");
                          const listNextWeeks = day.WorkingTimes.map((time) => {
                            const [hour, minute] = time.start
                              .split(":")
                              .map(Number);
                            let next = moment()
                              .tz("America/Sao_Paulo")
                              .day(day.dayOfWeek)
                              .hour(hour)
                              .minute(minute)
                              .second(0);
                            if (next.isBefore(nowDate))
                              next = next.add(1, "week");
                            return next.diff(nowDate, "minutes");
                          });

                          return Math.min(...listNextWeeks);
                        }).filter((s) => s >= 0),
                      );

                      console.log({ minutesToNextExecutionInQueue });
                      if (minutesToNextExecutionInQueue > 239) continue;

                      const dateNextExecution = moment()
                        .tz("America/Sao_paulo")
                        .add(minutesToNextExecutionInQueue, "minutes");

                      const dataLeadQueue = {
                        number: identifierLead,
                        pushName: m.pushName ?? "SEM NOME",
                        messageText,
                        messageAudio: messageAudio?.url,
                        messageImage: messageImage?.url,
                        messageImageCation: capitionImage,
                        messageVideo,
                      };

                      const pathOriginal =
                        pathChatbotQueue + `/${chatbot.id}.json`;

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
                          console.error(
                            "======= Error ao tentar escrever path",
                          );
                          console.log(error);
                        }
                      } else {
                        const chatbotQueue =
                          readFileSync(pathOriginal).toString();

                        if (chatbotQueue !== "") {
                          const JSONQueue: ChatbotQueue =
                            JSON.parse(chatbotQueue);
                          if (
                            !JSONQueue.queue.some(
                              (s) => s.number === identifierLead,
                            )
                          ) {
                            JSONQueue.queue.push(dataLeadQueue);
                          }
                          try {
                            await writeFile(
                              pathOriginal,
                              JSON.stringify(JSONQueue),
                            );
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
                      const cacheThisChatbot = cacheJobsChatbotQueue.get(
                        chatbot.id,
                      );
                      if (!cacheThisChatbot) {
                        await startChatbotQueue(chatbot.id);
                      }
                    } else {
                      await validMsgChatbot();
                      continue;
                    }
                  }
                  continue;
                }

                const campaignOfConnection = await prisma.campaign.findFirst({
                  where: {
                    accountId: props.accountId,
                    status: "running",
                    ConnectionOnCampaign: {
                      some: { connectionWAId: props.connectionWhatsId },
                    },
                    FlowState: {
                      some: {
                        isFinish: false,
                        ContactsWAOnAccount: {
                          ContactsWA: { completeNumber: identifierLead },
                        },
                      },
                    },
                  },
                  select: {
                    id: true,
                    flowId: true,
                  },
                });

                if (!!campaignOfConnection) {
                  const flowState = await prisma.flowState.findFirst({
                    where: {
                      campaignId: campaignOfConnection?.id,
                      ContactsWAOnAccount: {
                        ContactsWA: { completeNumber: identifierLead },
                      },
                    },
                    select: {
                      id: true,
                      indexNode: true,
                      flowId: true,
                      ContactsWAOnAccount: { select: { id: true } },
                      previous_response_id: true,
                    },
                  });

                  if (!flowState) {
                    const hash = ulid();
                    cacheRootSocket.forEach((sockId) =>
                      socketIo.to(sockId).emit(`geral-logs`, {
                        hash,
                        entity: "flowState",
                        type: "ERROR",
                        value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - campaignId: #${campaignOfConnection?.id} | Flow state da campanha não encontrada`,
                      }),
                    );
                    await prisma.geralLogDate.create({
                      data: {
                        hash,
                        entity: "flowState",
                        type: "ERROR",
                        value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - campaignId: #${campaignOfConnection?.id} | Flow state da campanha não encontrada`,
                      },
                    });
                    console.log("FlowState not found for lead");
                    continue;
                  }

                  if (!messageText && !messageAudio) {
                    const isSendMessageSuportText =
                      cacheSendMessageSuportText.get(keyMapLeadAwaiting);

                    if (!isSendMessageSuportText) {
                      await prisma.messages.create({
                        data: {
                          by: "contact",
                          message: "<Enviou mídia>",
                          type: "text",
                          messageKey: m.key.id,
                          status: "DELIVERED",
                          flowStateId: flowState.id,
                        },
                      });

                      const msg = await SendMessageText({
                        connectionId: props.connectionWhatsId,
                        text: "*Mensagem automática*\nEste chat oferece suporte a mensagens de texto ou áudio.",
                        toNumber: identifierLead,
                        quoted: m,
                      });

                      if (msg?.key?.id) {
                        await prisma.messages.create({
                          data: {
                            by: "system",
                            message:
                              "*Mensagem automática*\nEste chat oferece suporte a mensagens de texto ou áudio.",
                            type: "text",
                            messageKey: msg.key.id,
                            flowStateId: flowState.id,
                          },
                        });
                      }
                    }
                    continue;
                  }
                  cacheSendMessageSuportText.delete(keyMapLeadAwaiting);

                  leadAwaiting.set(keyMapLeadAwaiting, true);
                  const { id, flowId } = flowState;

                  let currentFlow = {} as {
                    nodes: any;
                    edges: any;
                    businessIds: number[];
                  };

                  if (flowId) {
                    let flowFetch = cacheFlowsMap.get(flowId);
                    if (!flowFetch) {
                      const getFlow = await ModelFlows.aggregate([
                        { $match: { accountId: props.accountId, _id: flowId } },
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
                      if (!getFlow) {
                        const hash = ulid();
                        cacheRootSocket.forEach((sockId) =>
                          socketIo.to(sockId).emit(`geral-logs`, {
                            hash,
                            entity: "flow",
                            type: "ERROR",
                            value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - campaignId: #${campaignOfConnection?.id} - flowId: #${flowId} | Flow não encontrado`,
                          }),
                        );
                        await prisma.geralLogDate.create({
                          data: {
                            hash,
                            entity: "flow",
                            type: "ERROR",
                            value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - campaignId: #${campaignOfConnection?.id} - flowId: #${flowId} | Flow não encontrado`,
                          },
                        });
                        console.log(`Flow not found. 4`);
                        continue;
                      }
                      const { edges, nodes, businessIds } = getFlow[0];
                      currentFlow = { nodes, edges, businessIds };
                      cacheFlowsMap.set(flowId, currentFlow);
                    } else {
                      currentFlow = flowFetch;
                    }
                  } else {
                    let flowFetch = cacheFlowsMap.get(
                      campaignOfConnection.flowId,
                    );
                    if (!flowFetch) {
                      const getFlow = await ModelFlows.aggregate([
                        {
                          $match: {
                            accountId: props.accountId,
                            _id: campaignOfConnection.flowId,
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
                      if (!getFlow) return console.log(`Flow not found. 5`);
                      const { edges, nodes, businessIds } = getFlow[0];
                      currentFlow = { nodes, edges, businessIds };
                      cacheFlowsMap.set(
                        campaignOfConnection.flowId,
                        currentFlow,
                      );
                    } else {
                      currentFlow = flowFetch;
                    }
                  }

                  const businessInfo = await prisma.connectionWA.findFirst({
                    where: { id: props.connectionWhatsId },
                    select: { Business: { select: { name: true, id: true } } },
                  });

                  if (!flowState.ContactsWAOnAccount) {
                    console.log("ContactsWAOnAccount not found for lead");
                    continue;
                  }

                  if (!currentFlow.nodes) {
                    console.log("Fluxo não encontrado, BAILEYS");
                    continue;
                  }

                  const ss = true;
                  if (ss) {
                    console.log("Campanhas estão temporariamente desativadas");
                    continue;
                  }

                  await NodeControler({
                    businessName: businessInfo?.Business.name!,
                    isSavePositionLead: true,
                    flowId: flowId || campaignOfConnection.flowId,
                    businessId: businessInfo!.Business.id,
                    isMidia:
                      isAudioMessage ||
                      isImageMessage ||
                      isDocumentMessage ||
                      isVideoMessage ||
                      !!contactMessage ||
                      !!locationMessage,
                    type: "running",
                    previous_response_id:
                      flowState.previous_response_id || undefined,
                    connectionId: props.connectionWhatsId,
                    external_adapter: {
                      type: "baileys",
                      clientWA: bot,
                    },
                    campaignId: campaignOfConnection?.id,
                    oldNodeId: flowState.indexNode || "0",
                    flowStateId: flowState.id,
                    contactAccountId: flowState.ContactsWAOnAccount.id,
                    lead_id: identifierLead,
                    action: null,
                    currentNodeId: flowState.indexNode || "0",
                    edges: currentFlow.edges,
                    nodes: currentFlow.nodes,
                    message: messageText || "",
                    accountId: props.accountId,
                    actions: {
                      onFinish: async (vl) => {
                        try {
                          await prisma.flowState.update({
                            where: { id: flowState.id },
                            data: { isFinish: true, finishedAt: new Date() },
                          });
                          webSocketEmitToRoom()
                            .account(props.accountId)
                            .dashboard.dashboard_services({
                              delta: -1,
                              hour: resolveHourAndMinute(),
                            });
                        } catch (error) {
                          console.log("Lead já foi finalizado nesse fluxo!");
                        }
                        // verificar se todos foram encerrados
                        const contactsInFlow = await prisma.flowState.count({
                          where: {
                            isFinish: false,
                            campaignId: campaignOfConnection?.id,
                          },
                        });
                        if (!contactsInFlow) {
                          await prisma.campaign.update({
                            where: { id: campaignOfConnection?.id },
                            data: { status: "finished" },
                          });
                          cacheAccountSocket
                            .get(props.accountId)
                            ?.listSocket.forEach((socketId) => {
                              socketIo.to(socketId.id).emit("status-campaign", {
                                campaignId: id,
                                status: "finished" as TypeStatusCampaign,
                              });
                            });
                        }
                        console.log("Finalizou!");
                      },
                      onEnterNode: async (nodeId) => {
                        await prisma.flowState
                          .update({
                            where: { id: flowState.id },
                            data: {
                              indexNode: nodeId.id,
                              flowId: nodeId.flowId,
                            },
                          })
                          .catch((err) => console.log(err));
                      },
                      onErrorClient: async () => {
                        const hash = ulid();
                        cacheRootSocket.forEach((sockId) =>
                          socketIo.to(sockId).emit(`geral-logs`, {
                            hash,
                            entity: "flow",
                            type: "ERROR",
                            value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - campaignId: #${id} | Error no cliente da conexão`,
                          }),
                        );
                        await prisma.geralLogDate.create({
                          data: {
                            hash,
                            entity: "flow",
                            type: "ERROR",
                            value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - campaignId: #${id} | Error no cliente da conexão`,
                          },
                        });
                        console.log(
                          "Erro no cliente, não foi possível enviar a mensagem",
                        );
                      },
                      onErrorNumber: async () => {
                        const hash = ulid();
                        cacheRootSocket.forEach((sockId) =>
                          socketIo.to(sockId).emit(`geral-logs`, {
                            hash,
                            entity: "flow",
                            type: "ERROR",
                            value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - campaignId: #${id} | Error no número do LEAD`,
                          }),
                        );
                        await prisma.geralLogDate.create({
                          data: {
                            hash,
                            entity: "flow",
                            type: "ERROR",
                            value: `Conexão: #${props.connectionWhatsId} - Account: #${props.accountId} - campaignId: #${id} | Error no número do LEAD`,
                          },
                        });
                        console.log(
                          "Erro no número, não foi possível enviar a mensagem",
                        );
                      },
                      onExecutedNode: async (node, isShots) => {
                        await prisma.flowState
                          .update({
                            where: { id: flowState.id },
                            data: {
                              indexNode: node.id,
                              flowId: node.flowId,
                              ...(isShots && { isSent: isShots }),
                            },
                          })
                          .catch((err) => console.log(err));
                      },
                    },
                  }).finally(() => {
                    leadAwaiting.set(keyMapLeadAwaiting, false);
                  });
                }
                continue;
              }
            }
          }
        });
      } catch (error) {
        const hash = ulid();
        cacheRootSocket.forEach((sockId) =>
          socketIo.to(sockId).emit(`geral-logs`, {
            hash,
            entity: "baileys",
            type: "ERROR",
            value: `Conexão: #${props.connectionWhatsId} - Account: #${
              props.accountId
            } | Error na conexão >> ${JSON.stringify(error)}`,
          }),
        );
        await prisma.geralLogDate.create({
          data: {
            hash,
            entity: "baileys",
            type: "ERROR",
            value: `Conexão: #${props.connectionWhatsId} - Account: #${
              props.accountId
            } | Error na conexão >> ${JSON.stringify(error)}`,
          },
        });
      }
    };
    run();
  });
};

export function deleteSession({ sessionId }: { sessionId: number }) {
  sessionsBaileysWA.get(sessionId)?.logout();
  sessionsBaileysWA.delete(sessionId);
}

export function getSessionSession({ sessionId }: { sessionId: number }) {
  return sessionsBaileysWA.get(sessionId);
}

export function getSessionStatus({ session }: { session: WASocket }) {
  return session.ev.emit("connection.update", { connection: "open" });
}

export function listSessions() {
  return Array.from(sessionsBaileysWA.entries()).map(([id, session]) => ({
    id,
    status: getSessionStatus({ session }),
  }));
}

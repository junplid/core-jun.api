import { Boom } from "@hapi/boom";
import makeWASocket, {
  DisconnectReason,
  WAConnectionState,
  WASocket,
  downloadMediaMessage,
  fetchLatestBaileysVersion,
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
import { cacheAccountSocket } from "../../infra/websocket/cache";
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
} from "./Cache";
import { startChatbotQueue } from "../../bin/startChatbotQueue";
import { validatePhoneNumber } from "../../helpers/validatePhoneNumber";
import mime from "mime-types";
import { SendMessageText } from "./modules/sendMessage";
import { TypingDelay } from "./modules/typing";
import { TypeStatusCampaign } from "@prisma/client";

/**
 * Estima quanto tempo (em segundos) alguém levou para digitar `text`.
 * @param text Texto que a pessoa digitou.
 * @param wpm  Velocidade média de digitação (padrão = 250 palavras/minuto).
 */
export function estimateTypingTime(text: string, wpm = 250): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length; // conta palavras
  const minutes = words / wpm;
  return Math.round(minutes * 60); // segundos (arredondado)
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
    bot?: WASocket
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
  accountId: number
) => {
  let path = "";
  if (process.env.NODE_ENV === "production") {
    path = resolve(__dirname, `./bin/connections.json`);
  } else {
    path = resolve(__dirname, `../../bin/connections.json`);
  }
  const connectionsList: CacheSessionsBaileysWA[] = JSON.parse(
    readFileSync(path).toString()
  );
  const newConnectionsList = connectionsList.filter(
    (c) => c.connectionWhatsId !== connectionId
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

  cacheConnectionsWAOnline.set(connectionId, false);

  if (process.env.NODE_ENV === "production") {
    path = resolve(__dirname, `./database-whatsapp/${connectionId}`);
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

export const Baileys = async ({
  socket,
  ...props
}: PropsBaileys): Promise<void> => {
  let attempts = 0;
  return new Promise((res, rej) => {
    const run = async (restart: boolean = false) => {
      function emitStatus(id: number, status: BaileysStatus) {
        cacheAccountSocket.get(props.accountId)?.listSocket?.forEach((sockId) =>
          socketIo.to(sockId).emit(`status-connection`, {
            connectionId: props.connectionWhatsId,
            connection: status,
          })
        );
      }

      async function softReconnect() {
        emitStatus(props.connectionWhatsId, "connecting");
        await new Promise((s) => setTimeout(s, 2_000));
        await run(true);
      }

      async function killAndClean(id: number, msg: string) {
        await killConnectionWA(id, props.accountId);
        emitStatus(id, "close");
      }
      const socketIds = cacheAccountSocket.get(props.accountId)?.listSocket;

      let path = "";
      if (process.env.NODE_ENV === "production") {
        path = resolve(
          __dirname,
          `./database-whatsapp/${props.connectionWhatsId}`
        );
      } else {
        path = resolve(
          __dirname,
          `../../../database-whatsapp/${props.connectionWhatsId}`
        );
      }
      ensureDirSync(path);

      const { state, saveCreds } = await useMultiFileAuthState(
        `./database-whatsapp/${props.connectionWhatsId}`
      );

      if (!saveCreds) {
        console.error("Bot desconectado");
        return;
      }
      const baileysVersion = await fetchLatestBaileysVersion();
      const bot = makeWASocket({
        auth: state,
        version: baileysVersion.version,
        defaultQueryTimeoutMs: undefined,
        qrTimeout: 40000,
        browser: ["Windows", "Chrome", "114.0.5735.198"],
        markOnlineOnConnect: true,
      });

      sessionsBaileysWA.set(props.connectionWhatsId, bot);
      const botfind = sessionsBaileysWA.get(props.connectionWhatsId);

      bot.ev.on(
        "connection.update",
        async ({ connection, lastDisconnect, qr }) => {
          if (connection) {
            cacheConnectionsWAOnline.set(
              props.connectionWhatsId,
              connection === "open"
            );
          }
          if (!!qr && socketIds?.length && !restart) {
            if (!!props.number) {
              const paircode = await bot.requestPairingCode(
                props.number.replace(/\D/g, "")
              );
              const code = paircode.split("");
              code.splice(4, 0, "-");
              socketIds.forEach((socketId) => {
                socketIo
                  .to(socketId)
                  .emit(
                    `pairing-code-${props.connectionWhatsId}`,
                    code.join("").split("-")
                  );
              });
            } else {
              socketIds.forEach((socketId) => {
                socketIo
                  .to(socketId)
                  .emit(`qr-code-${props.connectionWhatsId}`, qr);
              });
            }
          }

          if (connection) emitStatus(props.connectionWhatsId, connection);

          const reason = new Boom(lastDisconnect?.error).output.statusCode;

          if (connection === "close") {
            switch (reason) {
              case DisconnectReason.badSession:
                cacheConnectionsWAOnline.set(props.connectionWhatsId, false);
                await killAndClean(
                  props.connectionWhatsId,
                  "Sessão corrompida - limpando credenciais."
                );
                break;

              case DisconnectReason.connectionClosed:
              case DisconnectReason.connectionLost:
              case DisconnectReason.timedOut:
              case DisconnectReason.unavailableService:
                console.log("Conexão perdida - tentando reconectar…", attempts);
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
                  "Sessão substituída em outro dispositivo."
                );
                break;

              case DisconnectReason.loggedOut:
                cacheConnectionsWAOnline.set(props.connectionWhatsId, false);
                await killAndClean(
                  props.connectionWhatsId,
                  "Conta foi deslogada do WhatsApp."
                );
                break;

              case DisconnectReason.restartRequired:
                console.log("WhatsApp pediu restart - reiniciando sessão…");
                cacheConnectionsWAOnline.set(props.connectionWhatsId, false);
                await softReconnect();
                break;

              case DisconnectReason.forbidden:
                console.error("Número bloqueado / banido.");
                cacheConnectionsWAOnline.set(props.connectionWhatsId, false);
                emitStatus(props.connectionWhatsId, "close");
                break;

              case 405:
                cacheConnectionsWAOnline.set(props.connectionWhatsId, false);
                await killAndClean(
                  props.connectionWhatsId,
                  "Sessão corrompida - limpando credenciais."
                );
                break;

              default:
                cacheConnectionsWAOnline.set(props.connectionWhatsId, false);
                console.error("Motivo de desconexão não mapeado:", reason);
                emitStatus(props.connectionWhatsId, "close");
            }
            return;
          }
          if (connection === "open") {
            attempts = 0;
            try {
              emitStatus(props.connectionWhatsId, "open");
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
              if (cfg) {
                const tasks: Promise<unknown>[] = [];
                if (cfg.profileName) {
                  tasks.push(bot.updateProfileName(cfg.profileName));
                }
                if (cfg.fileNameImgPerfil) {
                  tasks.push(
                    bot.updateProfilePicture(`${number}@s.whatsapp.net`, {
                      url: resolve(
                        __dirname,
                        `../../../static/image/${cfg.fileNameImgPerfil}`
                      ),
                    })
                  );
                }
                if (cfg.profileStatus) {
                  tasks.push(bot.updateProfileStatus(cfg.profileStatus));
                }
                if (cfg.lastSeenPrivacy) {
                  tasks.push(bot.updateLastSeenPrivacy(cfg.lastSeenPrivacy));
                }
                if (cfg.onlinePrivacy) {
                  tasks.push(bot.updateOnlinePrivacy(cfg.onlinePrivacy));
                }
                if (cfg.readReceiptsPrivacy) {
                  tasks.push(
                    bot.updateReadReceiptsPrivacy(cfg.readReceiptsPrivacy)
                  );
                }
                if (cfg.statusPrivacy) {
                  tasks.push(bot.updateStatusPrivacy(cfg.statusPrivacy));
                }
                if (cfg.imgPerfilPrivacy) {
                  tasks.push(
                    bot.updateProfilePicturePrivacy(cfg.imgPerfilPrivacy)
                  );
                }
                await Promise.allSettled(tasks);
              }
              props.onConnection && props.onConnection(connection);
            } catch (error) {
              console.error("OPEN-handler error:", error);
            }
            res();
          }
        }
      );

      bot.ev.on("creds.update", saveCreds);

      bot.ev.on("messages.upsert", async (body) => {
        const isGroup = !!body.messages[0].key.remoteJid?.includes("@g.us");
        // body.messages[0].messageStubType === proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_ADD;
        // const isRemovedGroup = body.messages[0].messageStubType === proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_REMOVE;;
        if (
          !isGroup &&
          body.type === "notify" &&
          !body.messages[0].key.fromMe
        ) {
          const number = body.messages[0].key.remoteJid?.split("@")[0];
          if (!number) {
            console.log("Deu erro para recuperar número do lead");
            return;
          }
          // await bot.readMessages(body.messages.map((m) => m.key));
          // console.log({ audio: body.messages[0].message?.audioMessage?.url });

          const numberConnection = bot.user?.id.split(":")[0];
          const isAudioMessage = !!body.messages[0].message?.audioMessage?.url;
          const isImageMessage = !!body.messages[0].message?.imageMessage;
          const isDocumentMessage = !!body.messages[0].message?.documentMessage;
          const isVideoMessage = !!body.messages[0].message?.videoMessage;
          const contactMessage =
            body.messages[0].message?.contactMessage?.vcard;
          // const isArrayContactMessage =
          //   body.messages[0].message?.contactsArrayMessage?.contacts?.length;
          const locationMessage = body.messages[0].message?.locationMessage;

          const messageText =
            body.messages[0].message?.extendedTextMessage?.text ??
            body.messages[0].message?.conversation;

          const numberLead = validatePhoneNumber(number, { removeNine: true });

          if (!numberLead) {
            console.log("Error, Número do lead", `${number}`);
            return;
          }
          if (!numberConnection) {
            console.log("Error, Número da conexão", `${numberConnection}`);
            return;
          }

          const profilePicUrl = await bot
            .profilePictureUrl(body.messages[0].key.remoteJid!)
            .then((s) => s)
            .catch(() => undefined);

          const { ContactsWAOnAccount, ...contactWA } =
            await prisma.contactsWA.upsert({
              where: { completeNumber: number },
              create: {
                img: profilePicUrl,
                completeNumber: number!,
                ContactsWAOnAccount: {
                  create: {
                    accountId: props.accountId,
                    name: body.messages[0].pushName ?? "SEM NOME",
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
                name: body.messages[0].pushName ?? "SEM NOME",
                accountId: props.accountId,
                contactWAId: contactWA.id,
              },
              select: { id: true },
            });
            ContactsWAOnAccount.push({ id });
          }

          // Verifica se o lead está aguardando processamento
          if (leadAwaiting.get(number)) return;

          const messageAudio = body.messages[0].message?.audioMessage;
          const messageImage = body.messages[0].message?.imageMessage;
          const messageVideo = body.messages[0].message?.videoMessage?.url;
          const capitionImage = body.messages[0].message?.imageMessage?.caption;

          const doc = body.messages[0].message?.documentMessage;
          const docWithCaption =
            body.messages[0].message?.documentWithCaptionMessage?.message
              ?.documentMessage;

          const ticket = await prisma.tickets.findFirst({
            where: {
              status: { in: ["OPEN", "NEW"] },
              ContactsWAOnAccount: {
                ContactsWA: { completeNumber: numberLead },
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
            },
          });
          if (ticket) {
            if (!!messageText) {
              const isValidText = messageText.trim().length > 0;
              if (!isValidText) {
                console.log("Mensagem de texto inválida ou vazia.");
                return;
              }
            }
            let fileName = "";
            let fileNameOriginal = "";
            if (messageAudio) {
              const ext = mime.extension(messageAudio.mimetype || "audio/mpeg");
              fileName = `image_inbox_${Date.now()}.${ext}`;
              try {
                const buffer = await downloadMediaMessage(
                  body.messages[0],
                  "buffer",
                  {}
                );
                writeFileSync(
                  pathStatic + `/${fileName}`,
                  new Uint8Array(buffer)
                );
                leadAwaiting.set(numberLead, false);
              } catch (error) {
                console.log(error);
              }
            }
            if (messageImage) {
              const ext = mime.extension(messageImage.mimetype || "image/jpeg");
              fileName = `image_inbox_${Date.now()}.${ext}`;
              try {
                const buffer = await downloadMediaMessage(
                  body.messages[0],
                  "buffer",
                  {}
                );

                await writeFile(
                  pathStatic + `/${fileName}`,
                  new Uint8Array(buffer)
                );
              } catch (error) {
                console.log("ERRO NA OPERAÇÃO DE SALVAR IMAGEM!");
                console.log(error);
              }
            }
            if (doc) {
              const ext = mime.extension(
                doc?.mimetype || "text/html; charset=utf-8"
              );
              fileName = `file_inbox_${Date.now()}.${ext}`;
              fileNameOriginal = doc.fileName || "";
              try {
                const buffer = await downloadMediaMessage(
                  body.messages[0],
                  "buffer",
                  {}
                );
                if (!buffer || buffer.length === 0) {
                  console.log("Buffer de mídia vazio.");
                  return;
                }
                await writeFile(
                  pathStatic + `/${fileName}`,
                  new Uint8Array(buffer)
                );
              } catch (error) {
                console.log(error);
              }
            }
            if (docWithCaption) {
              const ext = mime.extension(
                doc?.mimetype || "text/html; charset=utf-8"
              );
              fileName = `file_inbox_${Date.now()}.${ext}`;
              fileNameOriginal = docWithCaption.fileName || "";
              try {
                const buffer = await downloadMediaMessage(
                  body.messages[0],
                  "buffer",
                  {}
                );
                if (!buffer || buffer.length === 0) {
                  console.log("Buffer de mídia vazio.");
                  return;
                }
                await writeFile(
                  pathStatic + `/${fileName}`,
                  new Uint8Array(buffer)
                );
              } catch (error) {
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
              if (user) isCurrentTicket = user.currentTicket === ticket.id;
            }

            const msg = await prisma.ticketMessage.create({
              data: {
                ticketsId: ticket.id,
                message: "",
                type: "text",
                ...(messageText && { type: "text", message: messageText }),
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
                messageKey: body.messages[0].key.id,
                read: isCurrentTicket,
              },
              select: { createAt: true, id: true },
            });

            const inboxSpace = socketIo.of(
              `/business-${ticket.InboxDepartment.businessId}/inbox`
            );

            cacheAccountSocket
              .get(ticket.accountId)
              ?.listSocket?.forEach((sockId) => {
                socketIo.to(sockId).emit(`inbox`, {
                  accountId: ticket.accountId,
                  departmentId: ticket.InboxDepartment.id,
                  departmentName: ticket.InboxDepartment.name,
                  status: "MESSAGE",
                  notifyMsc: true,
                  notifyToast: true,
                  id: ticket.id,
                });
                inboxSpace.emit("message-list", {
                  content: {
                    id: msg.id,
                    ...(messageText && { type: "text", text: messageText }),
                    ...(messageAudio && { type: "audio" }),
                    ...(messageImage && { type: "image" }),
                    ...((doc || docWithCaption) && { type: "file" }),
                  },
                  by: "contact",
                  departmentId: ticket.InboxDepartment.id,
                  notifyMsc: !isCurrentTicket,
                  notifyToast: false,
                  ticketId: ticket.id,
                  userId: ticket.inboxUserId, // caso seja enviado para um usuário.
                  lastInteractionDate: msg.createAt,
                  read: isCurrentTicket,
                });
                inboxSpace.emit("message", {
                  content: {
                    id: msg.id,
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
                  notifyMsc: !isCurrentTicket,
                  notifyToast: false,
                  ticketId: ticket.id,
                  userId: ticket.inboxUserId, // caso seja enviado para um usuário.
                  lastInteractionDate: msg.createAt,
                });
              });

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

            //   leadAwaiting.set(numberLead, false);
            return;
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
            const isToRestartChatbot = chatbotRestartInDate.get(
              `${numberConnection}+${numberLead}`
            );
            if (!!isToRestartChatbot) {
              const isbefore = moment()
                .tz("America/Sao_Paulo")
                .isBefore(isToRestartChatbot);
              console.log({ isbefore });
              if (isbefore) {
                return;
              } else {
                chatbotRestartInDate.delete(
                  `${numberConnection}+${numberLead}`
                );
              }
            }

            if (chatbot.addToLeadTagsIds.length) {
              const tagOnBusinessIds = await prisma.tag.findMany({
                where: { id: { in: chatbot.addToLeadTagsIds } },
                select: { id: true },
              });
              await Promise.all(
                tagOnBusinessIds.map(async ({ id }) => {
                  await prisma.tagOnContactsWAOnAccount.create({
                    data: {
                      contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                      tagId: id,
                    },
                  });
                })
              );
            }

            // if (chatbot.addLeadToAudiencesIds.length) {
            //   prisma.contactsWAOnAccountOnAudience.create({
            //     data: {
            //       audienceId: insertNewLeadsOnAudienceId,
            //       contactWAOnAccountId: ContactsWAOnAccount[0].id,
            //     },
            //   });
            // }

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
                    if (!flowFetch?.length)
                      return console.log(`Flow not found.`);
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
                    if (!flowFetch?.length)
                      return console.log(`Flow not found.`);
                    const { edges, nodes, businessIds } = flowFetch[0];
                    flow = { edges, nodes, businessIds };
                    cacheFlowsMap.set(chatbot.flowId, flow);
                  }
                }

                if (!flow) return console.log(`Flow não encontrado.`);
                //   const {
                //     typeActivation,
                //     typeMessageWhatsApp,
                //     ChatbotMessageActivationsFail,
                //     ChatbotMessageActivations,
                //     inputActivation,
                //   } = chatbot;
                //   let isValidM = false;
                //   let flowIdSend = chatbot.flowId;
                //   if (typeActivation) {
                //     if (typeActivation === "message") {
                //       if (typeMessageWhatsApp === "anyMessage") {
                //         if (
                //           ChatbotMessageActivationsFail?.text &&
                //           isTextMessage
                //         ) {
                //           isValidM = true;
                //         }
                //         if (
                //           ChatbotMessageActivationsFail?.audio &&
                //           isAudioMessage
                //         ) {
                //           isValidM = true;
                //         }
                //         if (
                //           ChatbotMessageActivationsFail?.image &&
                //           isImageMessage
                //         ) {
                //           isValidM = true;
                //         }
                //       }
                //       if (typeMessageWhatsApp === "textDetermined") {
                //         const isValidMessage = ChatbotMessageActivations.some(
                //           (activation) => {
                //             const activationValues =
                //               activation.ChatbotMessageActivationValues.map(
                //                 (chbm) => chbm.value
                //               );
                //             if (activation.type === "contains") {
                //               const regex = new RegExp(
                //                 `(${activationValues.join("|")})`,
                //                 `g${activation.caseSensitive ? "i" : ""}`
                //               );
                //               return regex.test(messageText ?? "");
                //             }
                //             if (activation.type === "different") {
                //               const regex = new RegExp(
                //                 `(${activationValues.join("|")})`,
                //                 activation.caseSensitive ? "i" : undefined
                //               );
                //               return !regex.test(messageText ?? "");
                //             }
                //             if (activation.type === "equal") {
                //               const regex = new RegExp(
                //                 `^(${activationValues.join("|")})$`,
                //                 activation.caseSensitive ? "i" : undefined
                //               );
                //               return regex.test(messageText ?? "");
                //             }
                //             if (activation.type === "startWith") {
                //               const regex = new RegExp(
                //                 `^(${activationValues.join("|")})`,
                //                 activation.caseSensitive ? "i" : undefined
                //               );
                //               return regex.test(messageText ?? "");
                //             }
                //           }
                //         );
                //         if (!isValidMessage) {
                //           const {
                //             receivingAudioMessages,
                //             receivingImageMessages,
                //             receivingNonStandardMessages,
                //             receivingVideoMessages,
                //           } = chatbot.ChatbotAlternativeFlows!;
                //           const isText =
                //             receivingNonStandardMessages && isTextMessage;
                //           if (isText) {
                //             flowIdSend = receivingNonStandardMessages;
                //             isValidM = true;
                //           }
                //           if (receivingAudioMessages && isAudioMessage) {
                //             flowIdSend = receivingAudioMessages;
                //             isValidM = true;
                //           }
                //           if (receivingImageMessages && isImageMessage) {
                //             flowIdSend = receivingImageMessages;
                //             isValidM = true;
                //           }
                //           if (receivingVideoMessages && isVideoMessage) {
                //             flowIdSend = receivingVideoMessages;
                //             isValidM = true;
                //           }
                //         }
                //         isValidM = true;
                //       }
                //     } else {
                //       if (messageText === inputActivation) {
                //         isValidM = true;
                //       } else {
                //         const {
                //           receivingAudioMessages,
                //           receivingImageMessages,
                //           receivingNonStandardMessages,
                //           receivingVideoMessages,
                //         } = chatbot.ChatbotAlternativeFlows!;
                //         const isText =
                //           receivingNonStandardMessages && isTextMessage;
                //         if (isText) {
                //           flowIdSend = receivingNonStandardMessages;
                //           isValidM = true;
                //         }
                //         if (receivingAudioMessages && isAudioMessage) {
                //           flowIdSend = receivingAudioMessages;
                //           isValidM = true;
                //         }
                //         if (receivingImageMessages && isImageMessage) {
                //           flowIdSend = receivingImageMessages;
                //           isValidM = true;
                //         }
                //         if (receivingVideoMessages && isVideoMessage) {
                //           flowIdSend = receivingVideoMessages;
                //           isValidM = true;
                //         }
                //       }
                //     }
                //     if (isValidM) {
                //       const { insertTagsLead, insertNewLeadsOnAudienceId } =
                //         chatbot;
                //       if (insertTagsLead) {
                //         const listTagsIdsLead: number[] = insertTagsLead
                //           .split("-")
                //           .map((s) => JSON.parse(s));
                //         // const tagOnBusinessIds =
                //         //   await prisma.tagOnBusiness.findMany({
                //         //     where: { tagId: { in: listTagsIdsLead } },
                //         //     select: { id: true },
                //         //   });
                //         // tagOnBusinessIds.forEach(({ id }) => {
                //         //   prisma.tagOnContactsWAOnAccount.create({
                //         //     data: {
                //         //       contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                //         //       tagOnBusinessId: id,
                //         //     },
                //         //   });
                //         // });
                //       }
                //       // if (insertNewLeadsOnAudienceId) {
                //       //   prisma.contactsWAOnAccountOnAudience.create({
                //       //     data: {
                //       //       audienceId: insertNewLeadsOnAudienceId,
                //       //       contactWAOnAccountId: ContactsWAOnAccount[0].id,
                //       //     },
                //       //   });
                //       // }
                //       const flowFetch = await ModelFlows.aggregate([
                //         {
                //           $match: {
                //             accountId: props.accountId,
                //             _id: flowIdSend,
                //           },
                //         },
                //         {
                //           $project: {
                //             businessIds: 1,
                //             nodes: {
                //               $map: {
                //                 input: "$data.nodes",
                //                 in: {
                //                   id: "$$this.id",
                //                   type: "$$this.type",
                //                   data: "$$this.data",
                //                 },
                //               },
                //             },
                //             edges: {
                //               $map: {
                //                 input: "$data.edges",
                //                 in: {
                //                   id: "$$this.id",
                //                   source: "$$this.source",
                //                   target: "$$this.target",
                //                   sourceHandle: "$$this.sourceHandle",
                //                 },
                //               },
                //             },
                //           },
                //         },
                //       ]);
                //       if (!flowFetch?.length)
                //         return console.log(`Flow not found.`);
                //       const { edges, nodes, businessIds } = flowFetch[0];
                //       let currentIndexNodeLead = await prisma.flowState.findFirst(
                //         {
                //           where: {
                //             connectionWAId: props.connectionWhatsId,
                //             contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                //             isFinish: false,
                //           },
                //           select: { indexNode: true, id: true },
                //         }
                //       );
                //       if (!currentIndexNodeLead) {
                //         currentIndexNodeLead = await prisma.flowState.create({
                //           data: {
                //             connectionWAId: props.connectionWhatsId,
                //             contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                //             indexNode: "0",
                //             flowId: flowIdSend,
                //           },
                //           select: { indexNode: true, id: true },
                //         });
                //       }
                //       const businessInfo = await prisma.connectionWA.findFirst({
                //         where: { id: props.connectionWhatsId },
                //         select: { Business: { select: { name: true } } },
                //       });
                //       if (!businessInfo) {
                //         console.log("Connection not found");
                //         return;
                //       }
                //       await NodeControler({
                //         businessName: businessInfo.Business.name,
                //         flowId: flowIdSend,
                //         flowBusinessIds: businessIds,
                //         type: "running",
                //         connectionWhatsId: props.connectionWhatsId,
                //         chatbotId: chatbot.id,
                //         clientWA: bot,
                //         isSavePositionLead: true,
                //         flowStateId: currentIndexNodeLead.id,
                //         contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                //         lead: { number: body.messages[0].key.remoteJid! },
                //         currentNodeId: currentIndexNodeLead?.indexNode ?? "0",
                //         edges: edges,
                //         nodes: nodes,
                //         numberConnection: numberConnection + "@s.whatsapp.net",
                //         message: messageText ?? "",
                //         accountId: props.accountId,
                //         onFinish: async (vl) => {
                //           if (currentIndexNodeLead) {
                //             const scheduleExecutionCache =
                //               scheduleExecutionsReply.get(
                //                 numberConnection +
                //                   "@s.whatsapp.net" +
                //                   body.messages[0].key.remoteJid!
                //               );
                //             if (scheduleExecutionCache) {
                //               scheduleExecutionCache.cancel();
                //             }
                //             console.log("TA CAINDO AQUI, finalizando fluxo");
                //             await prisma.flowState.update({
                //               where: { id: currentIndexNodeLead.id },
                //               data: { isFinish: true },
                //             });
                //           }
                //         },
                //         onExecutedNode: async (node) => {
                //           console.log({ currentIndexNodeLead });
                //           if (currentIndexNodeLead?.id) {
                //             try {
                //               await prisma.flowState
                //                 .update({
                //                   where: { id: currentIndexNodeLead.id },
                //                   data: { indexNode: node.id },
                //                 })
                //                 .catch((err) => console.log(err));
                //             } catch (error) {
                //               console.log("Error ao atualizar flowState!");
                //             }
                //           }
                //           // const indexCurrentAlreadyExist =
                //           //   await prisma.flowState.findFirst({
                //           //     where: {
                //           //       connectionWAId: props.connectionWhatsId,
                //           //       contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                //           //     },
                //           //     select: { id: true },
                //           //   });
                //           // if (!indexCurrentAlreadyExist) {
                //           //   await prisma.flowState.create({
                //           //     data: {
                //           //       indexNode: node.id,
                //           //       connectionWAId: props.connectionWhatsId,
                //           //       contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                //           //     },
                //           //   });
                //           // } else {
                //           //   await prisma.flowState.update({
                //           //     where: { id: indexCurrentAlreadyExist.id },
                //           //     data: { indexNode: node.id },
                //           //   });
                //           // }
                //         },
                //         onEnterNode: async (nodeId) => {
                //           const indexCurrentAlreadyExist =
                //             await prisma.flowState.findFirst({
                //               where: {
                //                 connectionWAId: props.connectionWhatsId,
                //                 contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                //               },
                //               select: { id: true },
                //             });
                //           if (!indexCurrentAlreadyExist) {
                //             await prisma.flowState.create({
                //               data: {
                //                 indexNode: nodeId,
                //                 connectionWAId: props.connectionWhatsId,
                //                 contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                //               },
                //             });
                //           } else {
                //             await prisma.flowState.update({
                //               where: { id: indexCurrentAlreadyExist.id },
                //               data: { indexNode: nodeId },
                //             });
                //           }
                //         },
                //       }).finally(() => {
                //         leadAwaiting.set(numberLead, false);
                //       });
                //     }
                //   }

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
                    },
                    select: {
                      indexNode: true,
                      id: true,
                      previous_response_id: true,
                    },
                  });
                }
                const businessInfo = await prisma.connectionWA.findFirst({
                  where: { id: props.connectionWhatsId },
                  select: { Business: { select: { name: true } } },
                });
                if (!businessInfo) {
                  console.log("Connection not found");
                  return;
                }

                await NodeControler({
                  businessName: chatbot.Business.name,
                  flowId: chatbot.flowId,
                  flowBusinessIds: flow.businessIds,
                  type: "running",
                  connectionWhatsId: props.connectionWhatsId,
                  chatbotId: chatbot.id,
                  oldNodeId: currentIndexNodeLead?.indexNode || "0",
                  previous_response_id:
                    currentIndexNodeLead.previous_response_id || undefined,
                  clientWA: bot,
                  isSavePositionLead: true,
                  flowStateId: currentIndexNodeLead.id,
                  contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                  lead: { number: body.messages[0].key.remoteJid! },
                  currentNodeId: currentIndexNodeLead?.indexNode || "0",
                  edges: flow.edges,
                  nodes: flow.nodes,
                  numberConnection: numberConnection + "@s.whatsapp.net",
                  message: messageText ?? "",
                  accountId: props.accountId,
                  actions: {
                    onFinish: async (vl) => {
                      if (currentIndexNodeLead) {
                        const scheduleExecutionCache =
                          scheduleExecutionsReply.get(
                            numberConnection +
                              "@s.whatsapp.net" +
                              body.messages[0].key.remoteJid!
                          );
                        if (scheduleExecutionCache) {
                          scheduleExecutionCache.cancel();
                        }
                        console.log("TA CAINDO AQUI, finalizando fluxo");
                        await prisma.flowState.update({
                          where: { id: currentIndexNodeLead.id },
                          data: { isFinish: true },
                        });
                        if (chatbot.TimeToRestart) {
                          const nextDate = moment()
                            .tz("America/Sao_Paulo")
                            .add(
                              chatbot.TimeToRestart.value,
                              chatbot.TimeToRestart.type
                            )
                            .toDate();
                          chatbotRestartInDate.set(
                            `${numberConnection}+${numberLead}`,
                            nextDate
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
                          console.log("Error ao atualizar flowState!");
                        }
                      }
                    },
                    onEnterNode: async (node) => {
                      const indexCurrentAlreadyExist =
                        await prisma.flowState.findFirst({
                          where: {
                            connectionWAId: props.connectionWhatsId,
                            contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                          },
                          select: { id: true },
                        });
                      if (!indexCurrentAlreadyExist) {
                        await prisma.flowState.create({
                          data: {
                            indexNode: node.id,
                            connectionWAId: props.connectionWhatsId,
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
                  },
                }).finally(() => {
                  leadAwaiting.set(number, false);
                });
              };

              if (!chatbot.OperatingDays.length) {
                return await validMsgChatbot();
              }

              const validTime = chatbot.OperatingDays.some((day) => {
                const nowTime = moment().tz("America/Sao_Paulo");
                const currentDayWeek = nowTime.get("weekday");

                if (day.dayOfWeek === currentDayWeek) {
                  if (day.WorkingTimes?.length) {
                    return day.WorkingTimes.some(({ end, start }) => {
                      return nowTime.isBetween(
                        getTimeBR(end),
                        getTimeBR(start)
                      );
                    });
                  } else {
                    return true;
                  }
                }
              });

              if (!validTime) {
                // não entendi pq tem isso aqui
                // const nowTime = moment().tz("America/Sao_Paulo");
                // const currentDayWeek = nowTime.get("weekday");
                // const isDayOperation = chatbot.OperatingDays.find(
                //   (o) => o.dayOfWeek === currentDayWeek
                // );
                // if (isDayOperation) {
                // } else {
                // }

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
                      setTimeout(resolve, 1000 * 60)
                    );
                    await TypingDelay({
                      connectionId: props.connectionWhatsId,
                      toNumber: numberLead + "@s.whatsapp.net",
                      delay: estimateTypingTime(chatbot.fallback),
                    });
                    await SendMessageText({
                      connectionId: props.connectionWhatsId,
                      text: chatbot.fallback,
                      toNumber: numberLead + "@s.whatsapp.net",
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
                  } else {
                    if (!flowState.fallbackSent) {
                      await new Promise((resolve) =>
                        setTimeout(resolve, 1000 * 60)
                      );
                      await TypingDelay({
                        connectionId: props.connectionWhatsId,
                        toNumber: numberLead + "@s.whatsapp.net",
                        delay: estimateTypingTime(chatbot.fallback),
                      });
                      await SendMessageText({
                        connectionId: props.connectionWhatsId,
                        text: chatbot.fallback,
                        toNumber: numberLead + "@s.whatsapp.net",
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
                      const [hour, minute] = time.start.split(":").map(Number);
                      let next = moment()
                        .tz("America/Sao_Paulo")
                        .day(day.dayOfWeek)
                        .hour(hour)
                        .minute(minute)
                        .second(0);
                      if (next.isBefore(nowDate)) next = next.add(1, "week");
                      return next.diff(nowDate, "minutes");

                      // const nextDayWeek = nowDate.set({
                      //   weekday: day.dayOfWeek,
                      //   hours: Number(time.start.slice(0, 2)),
                      //   minutes: Number(time.start.slice(3, 5)),
                      // });
                      // const minutes = nextDayWeek.diff(
                      //   moment().tz("America/Sao_Paulo"),
                      //   "minutes"
                      // );
                      // if (minutes >= 0) {
                      //   return minutes;
                      // } else {
                      //   // proxima semana.
                      // }
                    });

                    console.log({ listNextWeeks });

                    return Math.min(...listNextWeeks);
                  }).filter((s) => s >= 0)
                );

                console.log({ minutesToNextExecutionInQueue });
                const dateNextExecution = moment()
                  .tz("America/Sao_paulo")
                  .add(minutesToNextExecutionInQueue, "minutes");

                let path = "";
                if (process.env.NODE_ENV === "production") {
                  path = resolve(
                    __dirname,
                    `./bin/chatbot-queue/${chatbot.id}.json`
                  );
                } else {
                  path = resolve(
                    __dirname,
                    `../../bin/chatbot-queue/${chatbot.id}.json`
                  );
                }

                const dataLeadQueue = {
                  number: number,
                  pushName: body.messages[0].pushName ?? "SEM NOME",
                  messageText,
                  messageAudio: messageAudio?.url,
                  messageImage: messageImage?.url,
                  messageImageCation: capitionImage,
                  messageVideo,
                };

                console.log({ dateNextExecution });

                if (!existsSync(path)) {
                  console.info("======= Path não existia");
                  try {
                    console.info("======= Escrevendo PATH");

                    await writeFile(
                      path,
                      JSON.stringify({
                        "next-execution": dateNextExecution,
                        queue: [dataLeadQueue],
                      } as ChatbotQueue)
                    );
                  } catch (error) {
                    console.error("======= Error ao tentar escrever path");
                    console.log(error);
                  }
                } else {
                  const chatbotQueue = readFileSync(path).toString();

                  if (chatbotQueue !== "") {
                    const JSONQueue: ChatbotQueue = JSON.parse(chatbotQueue);
                    if (!JSONQueue.queue.some((s) => s.number === number)) {
                      JSONQueue.queue.push(dataLeadQueue);
                    }
                    try {
                      await writeFile(path, JSON.stringify(JSONQueue));
                    } catch (error) {
                      console.log(error);
                    }
                  } else {
                    try {
                      await writeFile(
                        path,
                        JSON.stringify({
                          "next-execution": dateNextExecution,
                          queue: [dataLeadQueue],
                        } as ChatbotQueue)
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
            return;
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
                    ContactsWA: { completeNumber: numberLead },
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
                  ContactsWA: { completeNumber: numberLead },
                },
              },
              select: {
                id: true,
                indexNode: true,
                flowId: true,
                ContactsWAOnAccount: { select: { id: true } },
              },
            });

            if (!flowState) return console.log("FlowState not found for lead");

            leadAwaiting.set(numberLead, true);
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
                if (!flowFetch) return console.log(`Flow not found.`);
                const { edges, nodes, businessIds } = getFlow[0];
                currentFlow = { nodes, edges, businessIds };
                cacheFlowsMap.set(flowId, currentFlow);
              }
            } else {
              let flowFetch = cacheFlowsMap.get(campaignOfConnection.flowId);
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
                if (!flowFetch) return console.log(`Flow not found.`);
                const { edges, nodes, businessIds } = getFlow[0];
                currentFlow = { nodes, edges, businessIds };
                cacheFlowsMap.set(campaignOfConnection.flowId, currentFlow);
              }
            }

            const businessInfo = await prisma.connectionWA.findFirst({
              where: { id: props.connectionWhatsId },
              select: { Business: { select: { name: true } } },
            });

            if (!flowState.ContactsWAOnAccount) {
              console.log("ContactsWAOnAccount not found for lead");
              return;
            }

            await NodeControler({
              businessName: businessInfo?.Business.name!,
              isSavePositionLead: true,
              flowId: flowId || campaignOfConnection.flowId,
              isMidia:
                isAudioMessage ||
                isImageMessage ||
                isDocumentMessage ||
                isVideoMessage ||
                !!contactMessage ||
                !!locationMessage,
              type: "running",
              connectionWhatsId: props.connectionWhatsId,
              clientWA: bot,
              campaignId: id,
              oldNodeId: flowState.indexNode || "0",
              flowStateId: flowState.id,
              contactsWAOnAccountId: flowState.ContactsWAOnAccount.id,
              lead: {
                number: numberLead + "@s.whatsapp.net",
              },
              currentNodeId: flowState.indexNode || "0",
              edges: currentFlow.edges,
              nodes: currentFlow.nodes,
              numberConnection: numberConnection + "@s.whatsapp.net",
              message: messageText || "",
              accountId: props.accountId,
              actions: {
                onFinish: async (vl) => {
                  try {
                    await prisma.flowState.update({
                      where: { id: flowState.id },
                      data: { isFinish: true },
                    });
                  } catch (error) {
                    console.log("Lead já foi finalizado nesse fluxo!");
                  }
                  // verificar se todos foram encerrados
                  const contactsInFlow = await prisma.flowState.count({
                    where: { isFinish: false, campaignId: id },
                  });
                  if (!contactsInFlow) {
                    await prisma.campaign.update({
                      where: { id },
                      data: { status: "finished" },
                    });
                    cacheAccountSocket
                      .get(props.accountId)
                      ?.listSocket.forEach((socketId) => {
                        socketIo.to(socketId).emit("status-campaign", {
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
                      data: { indexNode: nodeId.id },
                    })
                    .catch((err) => console.log(err));
                },
                onErrorClient: async () => {
                  console.log(
                    "Erro no cliente, não foi possível enviar a mensagem"
                  );
                },
                onErrorNumber: async () => {
                  console.log(
                    "Erro no número, não foi possível enviar a mensagem"
                  );
                },
                onExecutedNode: async (node, isShots) => {
                  await prisma.flowState
                    .update({
                      where: { id: flowState.id },
                      data: {
                        indexNode: node.id,
                        ...(isShots && { isSent: isShots }),
                      },
                    })
                    .catch((err) => console.log(err));
                },
              },
            }).finally(() => {
              leadAwaiting.set(numberLead, false);
            });
          }
          return;
        }
      });
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

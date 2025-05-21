import { Boom } from "@hapi/boom";
import { TypeConnetion } from "@prisma/client";
import makeWASocket, {
  DisconnectReason,
  WAConnectionState,
  WASocket,
  downloadMediaMessage,
  fetchLatestBaileysVersion,
  generateProfilePicture,
  proto,
  useMultiFileAuthState,
} from "baileys";
import { writeFileSync } from "fs";
import { existsSync, readFileSync, removeSync, writeFile } from "fs-extra";
import gm from "gm";
import phone from "libphonenumber-js";
import moment, { Moment } from "moment-timezone";
import { resolve } from "path";
import removeAccents from "remove-accents";
import { Socket } from "socket.io";
import { socketIo } from "../../infra/express";
import {
  cacheAccountSocket,
  cacheSocketAccount,
} from "../../infra/websocket/cache";
import { NodeControler } from "../../libs/FlowBuilder/Control";
import { prisma } from "../Prisma/client";
// import { clientRedis } from "../RedisDB";
import { ModelFlows } from "../mongo/models/flows";
import {
  cacheBaileys_SocketInReset,
  cacheConnectionsWAOnline,
  cacheJobsChatbotQueue,
  cacheFlowsMap,
  leadAwaiting,
  scheduleExecutionsReply,
} from "./Cache";
// import mime from "mime-types";
// import { Joi } from "express-validation";
// import { ChatCompletionMessageParam } from "openai/resources";
// import { v4 } from "uuid";
import { startChatbotQueue } from "../../bin/startChatbotQueue";
// import { clientRedis } from "../RedisDB";

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
  nameSession: GenerateNameSession;
  socket?: Socket;
  type: TypeConnetion | null;
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

export type GenerateNameConnection = string & {
  generateNameConnection: () => string;
};

export const generateNameConnection = (identificationName: string) => {
  return identificationName
    .trim()
    .replace(/\s+/g, "-") as GenerateNameConnection;
};

interface PropsGenerateNameSession {
  accountId: number;
  connectionWhatsId: number;
  nextNameConnection: GenerateNameConnection;
  type: TypeConnetion | null;
}

export type GenerateNameSession = string & {
  generateNameSession: () => string;
};

export const generateNameSession = (props: PropsGenerateNameSession) => {
  return removeAccents(
    `${props.accountId}-${props.connectionWhatsId}-${
      props.nextNameConnection
    }-${props.type || "all"}`
  ) as GenerateNameSession;
};

export const killConnectionWA = async (
  connectionId: number,
  accountId: number,
  nameSession: string
) => {
  const pathAuthBot = `./database-whatsapp/${accountId}/${nameSession}`;
  const pathConnections = resolve(__dirname, "../../bin/connections.json");
  const connectionsList: CacheSessionsBaileysWA[] = JSON.parse(
    readFileSync(pathConnections).toString()
  );
  const newConnectionsList = connectionsList.filter(
    (c) => c.connectionWhatsId !== connectionId
  );
  writeFileSync(pathConnections, JSON.stringify(newConnectionsList));
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
  bot?.ev.emit("connection.update", { connection: "close" });
  bot?.end({
    message: "Desconectando para reconectar...",
    name: "desconect-reconect",
  });
  sessionsBaileysWA.delete(connectionId);
  if (existsSync(pathAuthBot)) {
    try {
      removeSync(pathAuthBot);
    } catch (err) {
      console.error(`Ocorreu um erro ao excluir o diretório: ${err}`);
    }
  } else {
    console.log(`O diretório ${pathAuthBot} não existe.`);
  }
};

interface PropsSynchronizeTicketMessageHumanService {
  ticketId: number;
  data: {
    id: number;
    message: string;
    read: boolean;
    sentBy: "lead" | "attendant" | "system";
    type: "text";
    createAt: Date;
  };
}

export const Baileys = async ({
  socket,
  nameSession,
  ...props
}: PropsBaileys): Promise<void> => {
  return new Promise((res, rej) => {
    let numberOfConnectionAttempts: number = 0;
    let isOnlineLocal = false;

    const run = async () => {
      // const redis = await clientRedis();
      const socketIds = cacheAccountSocket.get(props.accountId)?.listSocket;

      const pathAuthBot = `./database-whatsapp/${props.accountId}/${nameSession}`;
      const { state, saveCreds } = await useMultiFileAuthState(pathAuthBot);

      if (!saveCreds) {
        console.error("Bot desconectado");
        return;
      }
      const baileysVersion = await fetchLatestBaileysVersion();
      const bot = makeWASocket({
        auth: state,
        version: baileysVersion.version,
        defaultQueryTimeoutMs: undefined,
        qrTimeout: 20000,
      });
      sessionsBaileysWA.set(props.connectionWhatsId, bot);

      let lastStatus: WAConnectionState | undefined = undefined;

      let reconect = false;

      const reconnectInterval = setInterval(async () => {
        if (isOnlineLocal) {
          reconect = true;
          cacheBaileys_SocketInReset.set(props.connectionWhatsId, true);
          console.log(
            "BAILEYS - Desconectando para reconectar...",
            props.connectionWhatsId,
            cacheBaileys_SocketInReset
          );
          bot.ev.emit("connection.update", { connection: "close" });
          bot.end({
            message: "Desconectando para reconectar...",
            name: "desconect-reconect",
          });
          isOnlineLocal = false;
          await new Promise((resolve) => setTimeout(resolve, 1000 * 3));
          await run();
        } else {
          console.log("Não esta conectado!");
        }
      }, 1000 * 60 * 50);

      bot.ev.on(
        "connection.update",
        async ({ connection, lastDisconnect, qr }) => {
          cacheConnectionsWAOnline.set(
            props.connectionWhatsId,
            connection === "open"
          );
          if (!!qr && socketIds?.length) {
            if (!!props.number) {
              const code = (await bot.requestPairingCode(props.number)).split(
                ""
              );
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

          const reason = new Boom(lastDisconnect?.error).output.statusCode; 

          if (connection === "close" && lastStatus !== "close") {
            lastStatus = connection;
            if (reason === DisconnectReason.badSession) {
              isOnlineLocal = false;
              if (!reconect) {
                clearInterval(reconnectInterval);
                await killConnectionWA(
                  props.connectionWhatsId,
                  props.accountId,
                  nameSession
                );
              }
            } else if (reason === DisconnectReason.connectionClosed) { 
              await run();
            } else if (reason === DisconnectReason.connectionLost) {
              isOnlineLocal = false;
              clearInterval(reconnectInterval);
              if (props.onConnection) props.onConnection("connectionLost");
              bot.end(
                // @ts-expect-error
                `Conexão perdida: ${reason} ${DisconnectReason.connectionLost[reason]}`
              );
            } else if (reason === DisconnectReason.connectionReplaced) { 
              await run();
            } else if (reason === DisconnectReason.loggedOut) {
              isOnlineLocal = false;
              clearInterval(reconnectInterval); 
              await killConnectionWA(
                props.connectionWhatsId,
                props.accountId,
                nameSession
              );
              return;
            } else if (reason === DisconnectReason.restartRequired) { 
              await run();
            } else {
              isOnlineLocal = false;
              clearInterval(reconnectInterval);
              bot.end(
                // @ts-expect-error
                `Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`
              );
            }
          }
          if (connection === "open" && lastStatus !== "open") {
            // bot.ev.emit("connection.update", { connection: "open" });
            try {
              sessionsBaileysWA.delete(props.connectionWhatsId);
              await new Promise((s) => setTimeout(s, 3000));
              sessionsBaileysWA.set(props.connectionWhatsId, bot);
              cacheBaileys_SocketInReset.set(props.connectionWhatsId, false);
              console.log(
                "BAILEYS - CONECTADO...",
                props.connectionWhatsId,
                cacheBaileys_SocketInReset
              );
              lastStatus = connection;
              const number = bot.user?.id.split(":")[0];
              const { ConnectionConfig } = await prisma.connectionWA.update({
                where: {
                  id: props.connectionWhatsId,
                  Business: { accountId: props.accountId },
                },
                data: { number },
                select: { ConnectionConfig: true },
              });
              setTimeout(async () => {
                if (ConnectionConfig?.profileName) {
                  await bot.updateProfileName(ConnectionConfig.profileName);
                }
                if (ConnectionConfig?.fileNameImgPerfil) {
                  const path = resolve(
                    __dirname,
                    `../../../static/image/${ConnectionConfig.fileNameImgPerfil}`
                  );
                  await bot.updateProfilePicture(`${number}@s.whatsapp.net`, {
                    url: path,
                  });
                }
                if (ConnectionConfig?.profileStatus)
                  await bot.updateProfileStatus(
                    ConnectionConfig?.profileStatus
                  );
                if (ConnectionConfig?.lastSeenPrivacy)
                  await bot.updateLastSeenPrivacy(
                    ConnectionConfig?.lastSeenPrivacy
                  );
                if (ConnectionConfig?.onlinePrivacy)
                  await bot.updateOnlinePrivacy(
                    ConnectionConfig?.onlinePrivacy
                  );
                if (ConnectionConfig?.readReceiptsPrivacy)
                  await bot.updateReadReceiptsPrivacy(
                    ConnectionConfig?.readReceiptsPrivacy
                  );
                // if (ConnectionConfig?.groupsAddPrivacy)
                //   await bot.updateGroupsAddPrivacy(
                //     ConnectionConfig?.groupsAddPrivacy
                //   );
                if (ConnectionConfig?.statusPrivacy)
                  await bot.updateStatusPrivacy(
                    ConnectionConfig?.statusPrivacy
                  );
                if (ConnectionConfig?.imgPerfilPrivacy)
                  await bot.updateProfilePicturePrivacy(
                    ConnectionConfig?.imgPerfilPrivacy
                  );
              }, 5000);
              props.onConnection && props.onConnection(connection);
              isOnlineLocal = true;
            } catch (error) {
              console.log(error);
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
          // console.log({ audio: body.messages[0].message?.audioMessage?.url });

          const numberLead = body.messages[0].key.remoteJid?.split("@")[0];
          const numberConnection = bot.user?.id.split(":")[0];
          const isTextMessage = !!(
            body.messages[0].message?.conversation ||
            body.messages[0].message?.extendedTextMessage?.text
          );
          const isAudioMessage = !!body.messages[0].message?.audioMessage?.url;
          const isImageMessage = !!body.messages[0].message?.imageMessage;
          const isDocumentMessage = !!body.messages[0].message?.documentMessage;
          const isVideoMessage = !!body.messages[0].message?.videoMessage;
          const contactMessage =
            body.messages[0].message?.contactMessage?.vcard;
          // const isArrayContactMessage =
          //   body.messages[0].message?.contactsArrayMessage?.contacts?.length;
          const locationMessage = body.messages[0].message?.locationMessage;

          const numberPhone = phone(`+${numberLead}`)?.format("INTERNATIONAL");

          if (!numberPhone) {
            console.log("Deu erro para recuperar número do lead");
            return;
          }
          const destructurePhone = numberPhone.split(" ");

          let completeNumber = "";

          if (destructurePhone[0] === "+55") {
            const isNineOnTheFront = destructurePhone.length > 2;
            if (isNineOnTheFront) {
              completeNumber =
                destructurePhone[0] +
                destructurePhone[1] +
                destructurePhone[2].slice(1) +
                destructurePhone[3];
            } else {
              completeNumber = destructurePhone.join("");
            }
          } else {
            completeNumber = destructurePhone.join("");
          }
          const profilePicUrl = await bot
            .profilePictureUrl(body.messages[0].key.remoteJid!)
            .then((s) => s)
            .catch(() => undefined);

          const { ContactsWAOnAccount, ...contactWA } =
            await prisma.contactsWA.upsert({
              where: { completeNumber: numberLead },
              create: {
                img: profilePicUrl,
                completeNumber: numberLead!,
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

          // const accountInfo = await prisma.accountSubscriptions.findFirst({
          //   where: { Account: { id: props.accountId, Plan: { type: "paid" } } },
          //   orderBy: { id: "desc" },
          //   select: {
          //     Payment: {
          //       take: 1,
          //       orderBy: { id: "desc" },
          //       select: { status: true },
          //     },
          //   },
          // });

          // if (accountInfo) {
          //   const validStatusPayment = Joi.string()
          //     .valid(
          //       "RECEIVED",
          //       "CONFIRMED",
          //       "RECEIVED_IN_CASH",
          //       "PAYMENT_ANTICIPATED"
          //     )
          //     .optional()
          //     .validate(accountInfo.Payment[0].status);

          //   if (validStatusPayment.error) {
          //     console.log("Os recursos foram interrompidos", {
          //       accountId: props.accountId,
          //     });
          //     return;
          //   }
          // }

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

          const messageText =
            body.messages[0].message?.extendedTextMessage?.text ??
            body.messages[0].message?.conversation;
          const messageAudio = body.messages[0].message?.audioMessage?.url;
          const messageImage = body.messages[0].message?.imageMessage?.url;
          const messageVideo = body.messages[0].message?.videoMessage?.url;
          const capitionImage = body.messages[0].message?.imageMessage?.caption;
          const doc = body.messages[0].message?.documentMessage;
          const docWithCaption =
            body.messages[0].message?.documentWithCaptionMessage?.message
              ?.documentMessage;

          if (!numberLead || !numberConnection) return;
          if (leadAwaiting.get(numberLead)) return;
          // const ticket = await prisma.tickets.findFirst({
          //   where: {
          //     Sectors: { status: true },
          //     status: { in: ["open", "new"] },
          //     ContactsWAOnAccount: {
          //       ContactsWA: { completeNumber: numberLead },
          //     },
          //     ConnectionOnBusiness: { number: numberConnection },
          //   },
          //   select: {
          //     protocol: true,
          //     businessId: true,
          //     id: true,
          //     sectorsAttendantsId: true,
          //     status: true,
          //     StepsFunnelKanbanOnTickets: {
          //       select: {
          //         StepsFunnelKanban: { select: { funnelKanbanId: true } },
          //       },
          //     },
          //   },
          // });
          // if (
          //   ticket &&
          //   (messageText ||
          //     messageAudio ||
          //     messageImage ||
          //     contactMessage ||
          //     // messageVideo ||
          //     doc ||
          //     docWithCaption ||
          //     locationMessage)
          // ) {
          //   const fileNameAudio = `audio_human-service_${Date.now()}`;
          //   const nameFile = `file_human-service_${Date.now()}_${
          //     doc?.fileName ?? docWithCaption?.fileName
          //   }`;
          //   const fileNameImage = `image_human-service_${Date.now()}`;
          //   // const fileNameVideo = `video_human-service_${Date.now()}`;
          //   if (
          //     messageAudio &&
          //     body.messages[0].message?.audioMessage?.mimetype
          //   ) {
          //     const exten = mime.extension(
          //       body.messages[0].message?.audioMessage?.mimetype
          //     );
          //     const pathFileAudio = resolve(
          //       __dirname,
          //       `../../../static/audio/${fileNameAudio}.${exten}`
          //     );
          //     try {
          //       const buffer = await downloadMediaMessage(
          //         body.messages[0],
          //         "buffer",
          //         {}
          //       );
          //       writeFileSync(pathFileAudio, new Uint8Array(buffer));
          //       leadAwaiting.set(numberLead, false);
          //     } catch (error) {
          //       console.log(error);
          //     }
          //   }
          //   if (
          //     messageImage &&
          //     body.messages[0].message?.imageMessage?.mimetype
          //   ) {
          //     const exten = mime.extension(
          //       body.messages[0].message?.imageMessage?.mimetype
          //     );
          //     const pathFileImageJpg = resolve(
          //       __dirname,
          //       `../../../static/image/${fileNameImage}.${exten}`
          //     );
          //     try {
          //       const buffer = await downloadMediaMessage(
          //         body.messages[0],
          //         "buffer",
          //         {}
          //       );

          //       await writeFile(pathFileImageJpg, new Uint8Array(buffer));
          //     } catch (error) {
          //       console.log("ERRO NA OPERAÇÃO DE SALVAR IMAGEM!");
          //       console.log(error);
          //     }
          //   }
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

          //   let nameFileWithExt = "";

          //   if (doc) {
          //     const exten = mime.extension(
          //       doc?.mimetype || "text/html; charset=utf-8"
          //     );
          //     nameFileWithExt = nameFile + `.${exten}`;
          //     const pathFileDoc = resolve(
          //       __dirname,
          //       `../../../static/file/${nameFileWithExt}`
          //     );
          //     try {
          //       const buffer = await downloadMediaMessage(
          //         body.messages[0],
          //         "buffer",
          //         {}
          //       );
          //       if (!buffer || buffer.length === 0) {
          //         console.log("Buffer de mídia vazio.");
          //         return;
          //       }
          //       await writeFile(pathFileDoc, new Uint8Array(buffer));
          //     } catch (error) {
          //       console.log(error);
          //     }
          //   }
          //   if (docWithCaption) {
          //     const exten = mime.extension(
          //       docWithCaption?.mimetype || "text/html; charset=utf-8"
          //     );
          //     nameFileWithExt = nameFile + `.${exten}`;
          //     const pathFileAudio = resolve(
          //       __dirname,
          //       `../../../static/file/${nameFileWithExt}`
          //     );
          //     try {
          //       const buffer = await downloadMediaMessage(
          //         body.messages[0],
          //         "buffer",
          //         {}
          //       );
          //       if (!buffer || buffer.length === 0) {
          //         console.log("Buffer de mídia vazio.");
          //         return;
          //       }
          //       await writeFile(pathFileAudio, new Uint8Array(buffer));
          //     } catch (error) {
          //       console.log(error);
          //     }
          //   }
          //   let isCurrentTicket = false;
          //   if (ticket.sectorsAttendantsId) {
          //     const user = CacheStateUserSocket.get(ticket.sectorsAttendantsId);
          //     isCurrentTicket = user?.currentTicket === ticket.id;
          //   }
          //   const extenImg = mime.extension(
          //     body.messages[0].message?.imageMessage?.mimetype || ""
          //   );
          //   const extenAudio = mime.extension(
          //     body.messages[0].message?.audioMessage?.mimetype || ""
          //   );
          //   // const extenVideo = mime.extension(
          //   //   body.messages[0].message?.videoMessage?.mimetype||''
          //   // );
          //   const filenameImg =
          //     fileNameImage + `${extenImg ? `.${extenImg}` : ""}`;
          //   const filenameAudio =
          //     fileNameAudio + `${extenAudio ? `.${extenAudio}` : ""}`;
          //   // const filenameVideo =
          //   // fileNameVideo + `${extenVideo ? `.${extenVideo}` : ""}`;

          //   const mess = await prisma.conversationTickes.create({
          //     data: {
          //       ticketsId: ticket.id,
          //       message: "",
          //       type: "text",
          //       ...(messageAudio && { type: "audio", fileName: filenameAudio }),
          //       ...(messageText && { type: "text", message: messageText }),
          //       ...(messageImage && {
          //         type: "image",
          //         fileName: filenameImg,
          //         ...(capitionImage && { caption: capitionImage }),
          //       }),
          //       ...(contactMessage && { type: "contact", ...objectVcard }),
          //       ...(locationMessage && {
          //         type: "location",
          //         degreesLatitude: String(locationMessage.degreesLatitude!),
          //         degreesLongitude: String(locationMessage.degreesLongitude!),
          //         address: locationMessage.address ?? "",
          //         name: locationMessage.name ?? "",
          //       }),
          //       ...((doc || docWithCaption) && {
          //         type: "file",
          //         fileName: nameFileWithExt,
          //         caption: docWithCaption?.caption ?? "",
          //       }),
          //       sentBy: "lead",
          //       messageKey: body.messages[0].key.id,
          //       read: isCurrentTicket,
          //     },
          //     select: { createAt: true, id: true },
          //   });

          //   const businessSpace = socketIo.of(
          //     `/business-${ticket.businessId}/human-service`
          //   );

          //   if (ticket.sectorsAttendantsId) {
          //     const content = messageText ?? "🎤📷 Arquivo de midia";
          //     const subject = `Nova mensagem | ticket: #${ticket.protocol}`;
          //     // const notification =
          //     //   await prisma.notificationsSectorsAttendants.create({
          //     //     data: {
          //     //       status: "unread",
          //     //       sectorsAttendantId: ticket.sectorsAttendantsId,
          //     //       content,
          //     //       subject,
          //     //     },
          //     //     select: { createAt: true, id: true },
          //     //   });

          //     if (!isCurrentTicket) {
          //       businessSpace.emit("insert-new-notification", {
          //         userId: ticket.sectorsAttendantsId,
          //         // ...notification,
          //         content,
          //         subject,
          //       });
          //     }
          //   }

          //   // atualizar a mensagem no kanban
          //   if (ticket.status === "open" && ticket.sectorsAttendantsId) {
          //     const stateUserHumanServide = CacheStateUserSocket.get(
          //       ticket.sectorsAttendantsId
          //     );
          //     if (stateUserHumanServide) {
          //       if (
          //         !stateUserHumanServide.isMobile &&
          //         stateUserHumanServide.linkedPages.includes("/kanban")
          //       ) {
          //         businessSpace.emit("synchronize-message-kanban", {
          //           ticketId: ticket.id,
          //           kanbanId:
          //             ticket.StepsFunnelKanbanOnTickets[0].StepsFunnelKanban
          //               .funnelKanbanId,
          //           lastMsg: {
          //             value: "🎤📷 Arquivo de midia",
          //             ...(messageText && { value: messageText }),
          //             date: moment(mess.createAt)
          //               .tz("America/Sao_Paulo")
          //               .toDate(),
          //           },
          //         });
          //       }
          //     }
          //     businessSpace.emit("sound-new-message", {
          //       userId: ticket.sectorsAttendantsId,
          //     });
          //   }

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
          //   return;
          // }

          console.log("VEIO AQUI!");
          const chatbot = await prisma.chatbot.findFirst({
            where: {
              connectionWAId: props.connectionWhatsId,
              accountId: props.accountId,
              status: true,
            },
            select: {
              id: true,
              flowId: true,
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
            },
          });

          if (chatbot) {
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
                let flow = cacheFlowsMap.get(chatbot.flowId);

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
                  if (!flowFetch?.length) return console.log(`Flow not found.`);
                  const { edges, nodes, businessIds } = flowFetch[0];
                  flow = { edges, nodes, businessIds };
                  cacheFlowsMap.set(chatbot.flowId, flow);
                }

                let currentIndexNodeLead = await prisma.flowState.findFirst({
                  where: {
                    connectionWAId: props.connectionWhatsId,
                    contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                    isFinish: false,
                  },
                  select: { indexNode: true, id: true },
                });
                if (!currentIndexNodeLead) {
                  currentIndexNodeLead = await prisma.flowState.create({
                    data: {
                      connectionWAId: props.connectionWhatsId,
                      contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                      indexNode: "0",
                      flowId: chatbot.flowId,
                    },
                    select: { indexNode: true, id: true },
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
                  clientWA: bot,
                  isSavePositionLead: true,
                  flowStateId: currentIndexNodeLead.id,
                  contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                  lead: { number: body.messages[0].key.remoteJid! },
                  currentNodeId: currentIndexNodeLead?.indexNode ?? "0",
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
                      }
                    },
                    onExecutedNode: async (node) => {
                      console.log({ currentIndexNodeLead });
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
                    onEnterNode: async (nodeId) => {
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
                            indexNode: nodeId,
                            connectionWAId: props.connectionWhatsId,
                            contactsWAOnAccountId: ContactsWAOnAccount[0].id,
                          },
                        });
                      } else {
                        await prisma.flowState.update({
                          where: { id: indexCurrentAlreadyExist.id },
                          data: { indexNode: nodeId },
                        });
                      }
                    },
                  },
                }).finally(() => {
                  leadAwaiting.set(numberLead, false);
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

                const minutesToNextExecutionInQueue = Math.min(
                  ...chatbot.OperatingDays.map((day) => {
                    const nowDate = moment().tz("America/Sao_Paulo");

                    const listNextWeeks = day.WorkingTimes.map((time) => {
                      const nextDayWeek = nowDate.startOf("day").set({
                        weekday: day.dayOfWeek,
                        hours: Number(time.start.slice(0, 2)),
                        minutes: Number(time.start.slice(3, 5)),
                      });
                      return nextDayWeek.diff(
                        moment().tz("America/Sao_Paulo"),
                        "minutes"
                      );
                    });

                    return Math.min(...listNextWeeks);
                  }).filter((s) => s >= 0)
                );

                const dateNextExecution = moment()
                  .tz("America/Sao_paulo")
                  .add(minutesToNextExecutionInQueue, "minutes");
                const pathChatbotQueue = resolve(
                  __dirname,
                  `../../bin/chatbot-queue/${chatbot.id}.json`
                );

                const dataLeadQueue = {
                  number: numberLead,
                  pushName: body.messages[0].pushName ?? "SEM NOME",
                  messageText,
                  messageAudio,
                  messageImage,
                  messageImageCation: capitionImage,
                  messageVideo,
                };

                if (!existsSync(pathChatbotQueue)) {
                  console.info("======= Path não existia");
                  try {
                    console.info("======= Escrevendo PATH");

                    await writeFile(
                      pathChatbotQueue,
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
                  console.info("======= Path existi");

                  const chatbotQueue =
                    readFileSync(pathChatbotQueue).toString();

                  if (chatbotQueue !== "") {
                    const JSONQueue: ChatbotQueue = JSON.parse(chatbotQueue);
                    if (!JSONQueue.queue.some((s) => s.number === numberLead)) {
                      JSONQueue.queue.push(dataLeadQueue);
                    }
                    try {
                      await writeFile(
                        pathChatbotQueue,
                        JSON.stringify(JSONQueue)
                      );
                    } catch (error) {
                      console.log(error);
                    }
                  } else {
                    try {
                      await writeFile(
                        pathChatbotQueue,
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
              }
            }
            return;
          }

          // const campaignOfConnection = await prisma.campaign.findFirst({
          //   where: {
          //     accountId: props.accountId,
          //     status: "running",
          //     CampaignOnBusiness: {
          //       some: {
          //         ConnectionOnCampaign: {
          //           some: {
          //             ConnectionOnBusiness: {
          //               id: props.connectionWhatsId,
          //               type: props.type,
          //               number: numberConnection,
          //             },
          //           },
          //         },
          //       },
          //     },
          //     FlowState: {
          //       some: {
          //         type: "campaign",
          //         isFinish: false,
          //         ContactsWAOnAccountOnAudience: {
          //           ContactsWAOnAccount: {
          //             ContactsWA: { completeNumber: numberLead },
          //           },
          //         },
          //       },
          //     },
          //   },
          //   select: {
          //     id: true,
          //     flowId: true,
          //     AudienceOnCampaign: {
          //       select: {
          //         Audience: {
          //           select: {
          //             ContactsWAOnAccountOnAudience: {
          //               where: {
          //                 ContactsWAOnAccount: {
          //                   ContactsWA: {
          //                     completeNumber: numberLead,
          //                   },
          //                 },
          //               },
          //               select: {
          //                 contactWAOnAccountId: true,
          //                 FlowState: {
          //                   where: {
          //                     isFinish: false,
          //                     type: "campaign",
          //                     Campaign: {
          //                       CampaignOnBusiness: {
          //                         some: {
          //                           ConnectionOnCampaign: {
          //                             some: {
          //                               ConnectionOnBusiness: {
          //                                 id: props.connectionWhatsId,
          //                                 type: props.type,
          //                                 number: numberConnection,
          //                               },
          //                             },
          //                           },
          //                         },
          //                       },
          //                     },
          //                   },
          //                   select: {
          //                     id: true,
          //                     flowId: true,
          //                     indexNode: true,
          //                     ContactsWAOnAccountOnAudience: {
          //                       select: {
          //                         ContactsWAOnAccount: {
          //                           select: {
          //                             ContactsWA: {
          //                               select: {
          //                                 completeNumber: true,
          //                               },
          //                             },
          //                           },
          //                         },
          //                       },
          //                     },
          //                   },
          //                 },
          //               },
          //             },
          //           },
          //         },
          //       },
          //     },
          //   },
          // });

          // if (!!campaignOfConnection) {
          //   leadAwaiting.set(numberLead, true);
          //   const { AudienceOnCampaign, id, flowId } = campaignOfConnection;

          //   const infoLead =
          //     AudienceOnCampaign[0].Audience.ContactsWAOnAccountOnAudience[0]
          //       .FlowState[0];
          //   let currentFlow: { nodes: any; edges: any } = {} as {
          //     nodes: any;
          //     edges: any;
          //   };

          //   if (!infoLead?.flowId) {
          //     let flowFetch = flowsMap.get("current");
          //     if (!flowFetch) {
          //       flowFetch = await ModelFlows.aggregate([
          //         { $match: { accountId: props.accountId, _id: flowId } },
          //         {
          //           $project: {
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
          //       if (!flowFetch) return console.log(`Flow not found.`);
          //       const { edges, nodes } = flowFetch[0];
          //       flowsMap.set("current", { nodes, edges });
          //     }
          //     const { edges, nodes } = flowsMap.get("current");
          //     currentFlow = { edges, nodes };
          //   } else {
          //     let flowFetch = flowsMap.get("current");
          //     if (!flowFetch) {
          //       flowFetch = await ModelFlows.aggregate([
          //         {
          //           $match: {
          //             accountId: props.accountId,
          //             _id: infoLead.flowId,
          //           },
          //         },
          //         {
          //           $project: {
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
          //       if (!flowFetch) return console.log(`Flow not found.`);
          //       const { edges, nodes } = flowFetch[0];
          //       flowsMap.set(String(infoLead.flowId), { nodes, edges });
          //     }
          //     const { edges, nodes } = flowsMap.get(String(infoLead.flowId));
          //     currentFlow = { edges, nodes };
          //   }
          //   const businessInfo = await prisma.connectionWA.findFirst({
          //     where: { id: props.connectionWhatsId },
          //     select: { Business: { select: { name: true } } },
          //   });

          //   await NodeControler({
          //     businessName: businessInfo?.Business.name!,
          //     isSavePositionLead: true,
          //     flowId: infoLead.flowId!,
          //     isMidia:
          //       isAudioMessage ||
          //       isImageMessage ||
          //       isDocumentMessage ||
          //       isVideoMessage ||
          //       !!contactMessage ||
          //       !!locationMessage,
          //     type: "running",
          //     connectionWhatsId: props.connectionWhatsId,
          //     clientWA: bot,
          //     campaignId: id,
          //     flowStateId: infoLead.id,
          //     contactsWAOnAccountId:
          //       AudienceOnCampaign[0].Audience.ContactsWAOnAccountOnAudience[0]
          //         .contactWAOnAccountId,
          //     lead: {
          //       number:
          //         infoLead.ContactsWAOnAccountOnAudience!.ContactsWAOnAccount.ContactsWA.completeNumber.replace(
          //           "+",
          //           ""
          //         ) + "@s.whatsapp.net",
          //     },
          //     currentNodeId: infoLead.indexNode ?? "0",
          //     edges: currentFlow.edges,
          //     nodes: currentFlow.nodes,
          //     numberConnection: numberConnection + "@s.whatsapp.net",
          //     message: messageText ?? "",
          //     accountId: props.accountId,
          //     onFinish: async (vl) => {
          //       try {
          //         await prisma.flowState.update({
          //           where: { id: infoLead.id },
          //           data: { isFinish: true },
          //         });
          //       } catch (error) {
          //         console.log("Lead já foi finalizado nesse fluxo!");
          //       }
          //       // verificar se todos foram encerrados
          //       const contactsInFlow = await prisma.flowState.count({
          //         where: { isFinish: false, campaignId: id },
          //       });
          //       if (!contactsInFlow) {
          //         await prisma.campaign.update({
          //           where: { id },
          //           data: { status: "finished" },
          //         });
          //         const socketId = cacheSocketAccount.get(props.accountId);
          //         if (socketId) {
          //           socketIo.to(socketId).emit("status-campaign", {
          //             campaignId: id,
          //             status: "finished" as TypeStatusCampaign,
          //           });
          //         }
          //       }
          //       console.log("Finalizou!");
          //     },
          //     onExecutedNode: async (node, isShots) => {
          //       await prisma.flowState
          //         .update({
          //           where: { id: infoLead.id },
          //           data: {
          //             indexNode: node.id,
          //             ...(isShots && { isSent: isShots }),
          //           },
          //         })
          //         .catch((err) => console.log(err));
          //     },
          //     onEnterNode: async (nodeId) => {
          //       await prisma.flowState
          //         .update({
          //           where: { id: infoLead.id },
          //           data: { indexNode: nodeId },
          //         })
          //         .catch((err) => console.log(err));
          //     },
          //   }).finally(() => {
          //     leadAwaiting.set(numberLead, false);
          //   });
          // }
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

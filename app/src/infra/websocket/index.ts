import { PrismaClient } from "@prisma/client";
import { readFile, writeFileSync } from "fs";
import { remove, writeFile } from "fs-extra";
import phone from "libphonenumber-js";
import { lookup } from "mime-types";
import moment from "moment-timezone";
import { resolve } from "path";
import { Server } from "socket.io";
import {
  Baileys,
  CacheSessionsBaileysWA,
  killConnectionWA,
} from "../../adapters/Baileys";
// import { clientRedis } from "../../adapters/RedisDB";
import {
  generateNameConnection,
  generateNameSession,
} from "./../../adapters/Baileys/index";
import { cacheAccountSocket } from "./cache";
import { SendLocation } from "../../adapters/Baileys/modules/sendLocation";
import { replaceVariablePlaceholders } from "../../helpers/replaceVariablePlaceholders";
import ffmpeg from "fluent-ffmpeg";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { SendContact } from "../../adapters/Baileys/modules/sendContact";
import { SendMessageText } from "../../adapters/Baileys/modules/sendMessage";
import { SendAudio } from "../../adapters/Baileys/modules/sendAudio";
import { SendImage } from "../../adapters/Baileys/modules/sendImage";
import { SendFile } from "../../adapters/Baileys/modules/sendFile";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";

interface PropsCreateSessionWA_I {
  connectionWhatsId: number;
  number?: string;
}

ffmpeg.setFfmpegPath(ffmpegPath);

async function convertToOpus(inputPath: string, outputPath: string) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .audioChannels(1)
      .audioCodec("libopus") // Codec para voz
      .audioBitrate(32) // Bitrate para otimizar o tamanho
      .toFormat("opus") // Formato de saída
      .addOutputOptions("-avoid_negative_ts make_zero")
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .run();
  });
}

const prisma = new PrismaClient();

// interface PropsSendMessafeHumanService {
//   userId: number;
//   ticketId: number;
//   data:
//     | { text: string; type: "text" }
//     | { type: "audio"; blob: Buffer }
//     | {
//         type: "image";
//         images: {
//           typeFile: string;
//           data: any;
//         }[];
//         caption: string;
//       }
//     | {
//         type: "file";
//         base64: string;
//         caption: string;
//         typeFile?: string;
//         fileName: string;
//       };
// }

// interface PropsSendContactHumanService {
//   userId: number;
//   ticketId: number;
//   data: {
//     type: "contact";
//     fullName: string;
//     number: string;
//     org: string;
//   };
// }

// interface PropsSendLocationHumanService {
//   userId: number;
//   ticketId: number;
//   data: { geolocationId: number };
// }

// type TypeActionSynchronizeTicket =
//   | "pick"
//   | "resolve"
//   | "reopen-ticket"
//   | "delete"
//   | "return"
//   | "new";

// interface EmitPick {
//   id: number;
//   status: "new" | "open" | "resolved";
//   attendantId?: number;
//   pendencies: number;
//   content: {
//     protocol: string;
//     contactName: string;
//     contactNumber: string;
//     contactImg: string;
//     columnId: number;
//     sectorName: string;
//     businessName: string;
//     countUnreadMsg: number;
//     lastMsg?: { value: string; date: Date };
//   };
// }
// type TSteps = "all" | "serving" | "unread" | "new" | "pending" | "resolved";

// interface CardTicket {
//   id: number;
//   status: TypeStatusTicket;
//   destination: TypeDestinationTicket;
//   sectorId: number;
//   insertSteps: TSteps[];
//   attendantId?: number;
//   color: string;
//   content: {
//     contactName: string;
//     contactImg: string;
//     sectorName: string;
//     businessName: string;
//     countUnreadMsg: number;
//     lastMsg?: { value: string; date: Date };
//   };
// }

// interface EmitNotifyToastMessage {
//   attendantId: number;
//   ticketId?: number;
//   message: string;
//   type: "error";
//   autoClose?: number;
// }

const isMobile = (userAgent: string) => {
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    userAgent
  );
};

export const WebSocketIo = (io: Server) => {
  io.on("connection", async (socket) => {
    const { headers, auth, query } = socket.handshake;
    console.log({ auth });

    const stateUser = cacheAccountSocket.get(auth.accountId);

    if (!stateUser) {
      cacheAccountSocket.set(auth.accountId, {
        //  isMobile: isMobile(headers["user-agent"]),
        listSocket: [socket.id],
      });
    } else {
      stateUser.listSocket.push(socket.id);
    }

    // funcionalidade de cancelar a conexão whatsapp em andamento

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
      const nameSession = generateNameSession({
        accountId: auth.accountId,
        connectionWhatsId: data.connectionWhatsId,
        type: connectionDB.type,
        nextNameConnection: generateNameConnection(connectionDB.name),
      });
      await Baileys({
        accountId: auth.accountId,
        connectionWhatsId: data.connectionWhatsId,
        socket: socket,
        nameSession,
        type: connectionDB.type,
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

          const fileBin = resolve(__dirname, "../../bin");
          const pathFileConnection = `${fileBin}/connections.json`;

          readFile(pathFileConnection, (err, file) => {
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
                nameSession,
                type: connectionDB.type,
              });
              writeFileSync(
                pathFileConnection,
                JSON.stringify(listConnections)
              );
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
      await killConnectionWA(
        data.connectionWhatsId,
        auth.accountId,
        generateNameSession({
          accountId: auth.accountId,
          connectionWhatsId: data.connectionWhatsId,
          type: connectionDB.type,
          nextNameConnection: generateNameConnection(connectionDB.name),
        })
      );
    });
  });

  // io.of(/^\/business-\d+\/human-service$/).on("connection", async (socket) => {
  //   const { headers, auth, query } = socket.handshake;

  //   if (!query?.page || !headers["user-agent"]) {
  //     return socket.disconnect();
  //   }

  //   const stateUser = CacheStateUserSocket.get(auth.userId);

  //   const currentPage = query.page as string;
  //   if (!stateUser) {
  //     CacheStateUserSocket.set(auth.userId, {
  //       currentPage,
  //       linkedPages: [query.page as string],
  //       isMobile: isMobile(headers["user-agent"]),
  //       id: auth.userId,
  //       listSocket: [socket.id],
  //       currentTicket: null,
  //     });
  //   } else {
  //     stateUser.currentPage = currentPage;
  //     if (!stateUser.linkedPages.includes(currentPage)) {
  //       stateUser.linkedPages.push(currentPage);
  //     }
  //     stateUser.listSocket.push(socket.id);
  //   }

  //   socket.on("disconnect", async (reason) => {
  //     const stateUser = CacheStateUserSocket.get(auth.userId);
  //     if (stateUser) {
  //       stateUser.linkedPages = stateUser.linkedPages.filter(
  //         (page) => page !== currentPage
  //       );
  //       if (stateUser.linkedPages.includes("/")) {
  //         stateUser.currentPage = "/";
  //       } else {
  //         stateUser.currentPage = stateUser.linkedPages[0];
  //       }
  //       stateUser.listSocket.filter((ids) => ids !== socket.id);
  //     }
  //   });

  //   socket.on(
  //     "current-ticket",
  //     async (props: { userId: number; ticketId: number | null }) => {
  //       const stateUser = CacheStateUserSocket.get(auth.userId);
  //       if (stateUser) {
  //         if (props.ticketId) {
  //           stateUser.currentTicket = props.ticketId;
  //         } else {
  //           stateUser.currentTicket = null;
  //         }
  //       }
  //     }
  //   );

  //   socket.on(
  //     "send-contact",
  //     async ({ data, ...props }: PropsSendContactHumanService) => {
  //       const fetchData = await prisma.tickets.findUnique({
  //         where: { id: props.ticketId, sectorsAttendantsId: props.userId },
  //         select: {
  //           connectionId: true,
  //           ContactsWAOnAccount: {
  //             select: { ContactsWA: { select: { completeNumber: true } } },
  //           },
  //         },
  //       });
  //       if (fetchData) {
  //         const verifiedNumber = phone(data.number, {
  //           defaultCountry: "BR",
  //           extract: true,
  //           defaultCallingCode: "55",
  //         });
  //         if (!verifiedNumber) {
  //           console.log("Deu erro para recuperar número do lead");
  //           return;
  //         }

  //         const formatNumber = verifiedNumber.formatInternational().split(" ");
  //         let numberId = "";
  //         let numberPrev = "";

  //         if (formatNumber.length > 2) {
  //           numberId =
  //             formatNumber[0].slice(1) +
  //             formatNumber[1] +
  //             formatNumber[2].slice(1) +
  //             formatNumber[3];
  //           formatNumber[2] = formatNumber[2].slice(1);
  //           numberPrev = formatNumber.join(" ");
  //         } else {
  //           numberId = formatNumber[0].slice(1) + formatNumber[1];
  //           numberPrev =
  //             formatNumber[0] +
  //             " " +
  //             formatNumber[1].replace(/(\d{2})(\d{4})(\d{4})/, "$1 $2 $3");
  //         }
  //         const message = await SendContact({
  //           connectionId: fetchData.connectionId,
  //           fullName: data.fullName.split(" ")[0],
  //           org: data.org,
  //           numberSend: numberId,
  //           toNumber: fetchData.ContactsWAOnAccount.ContactsWA.completeNumber,
  //         });
  //         if (message) {
  //           const dataC = await prisma.conversationTickes.create({
  //             data: {
  //               sentBy: "attendant",
  //               ticketsId: props.ticketId,
  //               sectorsAttendantsId: props.userId,
  //               messageKey: message.key.id,
  //               ...data,
  //               number: numberId,
  //               message: "",
  //             },
  //             select: { createAt: true, id: true },
  //           });
  //           socket.emit("synchronize-message", {
  //             ticketId: props.ticketId,
  //             data: {
  //               ...data,
  //               clear: true,
  //               number: numberId,
  //               createAt: dataC.createAt,
  //               id: dataC.id,
  //               read: true,
  //               sentBy: "attendant",
  //             },
  //           });
  //         }
  //       }
  //     }
  //   );

  //   socket.on(
  //     "send-location",
  //     async ({ data, ...props }: PropsSendLocationHumanService) => {
  //       const fetchData = await prisma.tickets.findUnique({
  //         where: { id: props.ticketId, sectorsAttendantsId: props.userId },
  //         select: {
  //           connectionId: true,
  //           ContactsWAOnAccount: {
  //             select: { ContactsWA: { select: { completeNumber: true } } },
  //           },
  //         },
  //       });
  //       if (fetchData) {
  //         const location = await prisma.geolocation.findFirst({
  //           where: { id: data.geolocationId },
  //           select: {
  //             latitude: true,
  //             longitude: true,
  //             address: true,
  //             name: true,
  //           },
  //         });

  //         if (!location) {
  //           console.log("Localização não encontrada!");
  //           return;
  //         }

  //         const message = await SendLocation({
  //           connectionId: fetchData.connectionId,
  //           toNumber: fetchData.ContactsWAOnAccount.ContactsWA.completeNumber,
  //           location,
  //         });
  //         if (message) {
  //           const dataC = await prisma.conversationTickes.create({
  //             data: {
  //               message: "",
  //               sentBy: "attendant",
  //               ticketsId: props.ticketId,
  //               sectorsAttendantsId: props.userId,
  //               messageKey: message.key.id,
  //               type: "location",
  //               name: location.name,
  //               address: location.address || undefined,
  //               degreesLongitude: location.longitude,
  //               degreesLatitude: location.latitude,
  //             },
  //             select: { createAt: true, id: true },
  //           });
  //           socket.emit("synchronize-message", {
  //             ticketId: props.ticketId,
  //             data: {
  //               ...data,
  //               name: location.name,
  //               address: location.address || undefined,
  //               degreesLongitude: location.longitude,
  //               degreesLatitude: location.latitude,
  //               clear: true,
  //               type: "location",
  //               createAt: dataC.createAt,
  //               id: dataC.id,
  //               read: true,
  //               sentBy: "attendant",
  //             },
  //           });
  //         }
  //       }
  //     }
  //   );

  //   socket.on("send-content", async (props: PropsSendMessafeHumanService) => {
  //     if (props.data.type === "text" && /^\s*$/.test(props.data.text)) return;

  //     const fetchData = await prisma.tickets.findUnique({
  //       where: { id: props.ticketId },
  //       select: {
  //         status: true,
  //         deleted: true,
  //         protocol: true,
  //         SectorsAttendants: {
  //           select: {
  //             id: true,
  //             office: true,
  //             name: true,
  //             Sectors: {
  //               select: {
  //                 name: true,
  //                 signAttendant: true,
  //                 Business: { select: { name: true } },
  //                 signBusiness: true,
  //                 signSector: true,
  //               },
  //             },
  //           },
  //         },
  //         StepsFunnelKanbanOnTickets: {
  //           select: { StepsFunnelKanban: { select: { funnelKanbanId: true } } },
  //         },
  //         connectionId: true,
  //         ContactsWAOnAccount: {
  //           select: { ContactsWA: { select: { completeNumber: true } } },
  //         },
  //       },
  //     });
  //     if (!fetchData) {
  //       const message: EmitNotifyToastMessage = {
  //         attendantId: props.userId,
  //         message: "Não foi possível enviar mensagem. Ticket não encontrado",
  //         type: "error",
  //         autoClose: 3000,
  //       };
  //       return socket.emit("notify-toast-message", message);
  //     }

  //     if (fetchData?.deleted) {
  //       const message: EmitNotifyToastMessage = {
  //         attendantId: props.userId,
  //         message: "Não é possível enviar mensagem um ticket que foi apagado",
  //         type: "error",
  //         autoClose: 3000,
  //       };
  //       return socket.emit("notify-toast-message", message);
  //     }

  //     if (fetchData?.status !== "open") {
  //       const message: EmitNotifyToastMessage = {
  //         attendantId: props.userId,
  //         message: "Só é possível enviar mensagens para tickets abertos",
  //         type: "error",
  //         autoClose: 3000,
  //       };
  //       return socket.emit("notify-toast-message", message);
  //     }

  //     if (fetchData?.SectorsAttendants?.id !== props.userId) {
  //       const message: EmitNotifyToastMessage = {
  //         attendantId: props.userId,
  //         message:
  //           "Não é possível enviar mensagem para ticket de outro portador",
  //         type: "error",
  //         autoClose: 3000,
  //       };
  //       return socket.emit("notify-toast-message", message);
  //     }

  //     const stateUserHumanServide = CacheStateUserSocket.get(props.userId);

  //     // ok
  //     if (props.data.type === "text") {
  //       const jid =
  //         fetchData.ContactsWAOnAccount.ContactsWA.completeNumber.replace(
  //           "+",
  //           ""
  //         ) + "@s.whatsapp.net";
  //       let signature = "";
  //       if (fetchData?.SectorsAttendants?.Sectors?.signBusiness) {
  //         signature += `*${fetchData.SectorsAttendants.Sectors.Business.name}*\n`;
  //       }
  //       if (fetchData?.SectorsAttendants?.Sectors?.signSector) {
  //         signature += `Setor: *${fetchData.SectorsAttendants.Sectors.name}*\n`;
  //       }
  //       if (fetchData?.SectorsAttendants?.Sectors?.signAttendant) {
  //         signature += `${fetchData.SectorsAttendants.office}: *${fetchData.SectorsAttendants.name}*\n`;
  //       }

  //       const nextText = await replaceVariablePlaceholders(props.data.text).ah(
  //         props.ticketId
  //       );

  //       try {
  //         const message = await SendMessageText({
  //           connectionId: fetchData.connectionId,
  //           text: `${signature}${nextText}`,
  //           toNumber: jid,
  //         });

  //         if (message) {
  //           const dataC = await prisma.conversationTickes.create({
  //             data: {
  //               message: nextText,
  //               sentBy: "attendant",
  //               type: props.data.type,
  //               ticketsId: props.ticketId,
  //               sectorsAttendantsId: props.userId,
  //               messageKey: message.key.id,
  //             },
  //             select: { createAt: true, id: true },
  //           });

  //           socket.emit("synchronize-message", {
  //             ticketId: props.ticketId,
  //             data: {
  //               type: "text",
  //               clear: true,
  //               createAt: moment(dataC.createAt)
  //                 .tz("America/Sao_Paulo")
  //                 .toDate(),
  //               id: dataC.id,
  //               message: nextText,
  //               read: true,
  //               sentBy: "attendant",
  //             },
  //           });
  //           if (stateUserHumanServide) {
  //             if (
  //               !stateUserHumanServide.isMobile &&
  //               stateUserHumanServide.linkedPages.includes("/kanban")
  //             ) {
  //               socket.emit("synchronize-message-kanban", {
  //                 ticketId: props.ticketId,
  //                 kanbanId:
  //                   fetchData.StepsFunnelKanbanOnTickets[0].StepsFunnelKanban
  //                     .funnelKanbanId,
  //                 lastMsg: {
  //                   value: nextText,
  //                   date: moment(dataC.createAt)
  //                     .tz("America/Sao_Paulo")
  //                     .toDate(),
  //                 },
  //               });
  //             }
  //           }
  //         }
  //       } catch (error) {
  //         console.log("ERROR");
  //       }
  //       return;
  //     }

  //     if (props.data.type === "audio") {
  //       const nameF = `audio_human-service_${Date.now()}`;
  //       const audioFileNameOpus = nameF + `.opus`;
  //       try {
  //         const inputPathMp3 = resolve(
  //           __dirname,
  //           `../../../static/audio/${nameF}.mp3`
  //         );
  //         const outputPathOpus = resolve(
  //           __dirname,
  //           `../../../static/audio/${nameF}.opus`
  //         );

  //         const buffer = new Uint8Array(props.data.blob);
  //         await writeFile(inputPathMp3, new Uint8Array(buffer));
  //         await convertToOpus(inputPathMp3, outputPathOpus);
  //         await remove(inputPathMp3);

  //         const message = await SendAudio({
  //           connectionId: fetchData.connectionId,
  //           toNumber:
  //             fetchData.ContactsWAOnAccount.ContactsWA.completeNumber.replace(
  //               "+",
  //               ""
  //             ) + "@s.whatsapp.net",
  //           mimetype: "audio/ogg; codecs=opus",
  //           urlStatic: outputPathOpus,
  //         });
  //         if (message) {
  //           const dataC = await prisma.conversationTickes.create({
  //             data: {
  //               message: "",
  //               fileName: audioFileNameOpus,
  //               sentBy: "attendant",
  //               type: props.data.type,
  //               ticketsId: props.ticketId,
  //               sectorsAttendantsId: props.userId,
  //               messageKey: message.key.id,
  //             },
  //             select: { createAt: true, id: true },
  //           });
  //           socket.emit("synchronize-message", {
  //             ticketId: props.ticketId,
  //             data: {
  //               type: "audio",
  //               clear: true,
  //               fileName: audioFileNameOpus,
  //               createAt: dataC.createAt,
  //               id: dataC.id,
  //               read: true,
  //               sentBy: "attendant",
  //             },
  //           });
  //           if (stateUserHumanServide) {
  //             if (
  //               !stateUserHumanServide.isMobile &&
  //               stateUserHumanServide.linkedPages.includes("/kanban")
  //             ) {
  //               socket.emit("synchronize-message-kanban", {
  //                 ticketId: props.ticketId,
  //                 kanbanId:
  //                   fetchData.StepsFunnelKanbanOnTickets[0].StepsFunnelKanban
  //                     .funnelKanbanId,
  //                 lastMsg: {
  //                   value: "🎤📷 Arquivo de midia",
  //                   date: dataC.createAt,
  //                 },
  //               });
  //             }
  //           }
  //         }
  //       } catch (error) {
  //         console.log("Não foi possivel salvar", error);
  //       }
  //       return;
  //     }

  //     // OK
  //     if (props.data.type === "image") {
  //       if (props.data.images.length === 0) return;
  //       let nextCaption = "";
  //       if (props.data.caption.length) {
  //         nextCaption = await replaceVariablePlaceholders(
  //           props.data.caption
  //         ).ah(props.ticketId);
  //       }
  //       for await (const image of props.data.images) {
  //         const index = props.data.images.indexOf(image);
  //         const imageFileName = `image_human-service_${Date.now()}.${
  //           image.typeFile.split("/")[1]
  //         }`;
  //         try {
  //           const path = resolve(
  //             __dirname,
  //             `../../../static/image/${imageFileName}`
  //           );
  //           await writeFile(path, image.data, "binary");

  //           const message = await SendImage({
  //             connectionId: fetchData.connectionId,
  //             toNumber:
  //               fetchData.ContactsWAOnAccount.ContactsWA.completeNumber.replace(
  //                 "+",
  //                 ""
  //               ) + "@s.whatsapp.net",
  //             url: path,
  //             ...(index === 0 &&
  //               nextCaption.length && {
  //                 caption: nextCaption,
  //               }),
  //           });
  //           if (message) {
  //             const dataC = await prisma.conversationTickes.create({
  //               data: {
  //                 message: "",
  //                 fileName: imageFileName,
  //                 sentBy: "attendant",
  //                 type: props.data.type,
  //                 ticketsId: props.ticketId,
  //                 sectorsAttendantsId: props.userId,
  //                 messageKey: message.key.id,
  //                 ...(index === 0 &&
  //                   nextCaption.length && {
  //                     caption: nextCaption,
  //                   }),
  //               },
  //               select: { createAt: true, id: true },
  //             });
  //             socket.emit("synchronize-message", {
  //               ticketId: props.ticketId,
  //               data: {
  //                 type: "image",
  //                 clear: true,
  //                 fileName: imageFileName,
  //                 createAt: dataC.createAt,
  //                 ...(nextCaption.length && {
  //                   caption: nextCaption,
  //                 }),
  //                 id: dataC.id,
  //                 read: true,
  //                 sentBy: "attendant",
  //               },
  //             });
  //             if (stateUserHumanServide) {
  //               if (
  //                 !stateUserHumanServide.isMobile &&
  //                 stateUserHumanServide.linkedPages.includes("/kanban")
  //               ) {
  //                 socket.emit("synchronize-message-kanban", {
  //                   ticketId: props.ticketId,
  //                   kanbanId:
  //                     fetchData.StepsFunnelKanbanOnTickets[0].StepsFunnelKanban
  //                       .funnelKanbanId,
  //                   lastMsg: {
  //                     value: "🎤📷 Arquivo de midia",
  //                     date: dataC.createAt,
  //                   },
  //                 });
  //               }
  //             }
  //           }
  //         } catch (error) {
  //           console.log("Não foi possivel salvar", error);
  //         }
  //       }
  //       return;
  //     }

  //     if (props.data.type === "file") {
  //       const fileFileName = `${props.data.fileName}_${Date.now()}${
  //         props.data.typeFile ? props.data.typeFile : ".txt"
  //       }`;
  //       // let nextCaption = "";
  //       // if (props.data.caption.length) {
  //       //   nextCaption = await replaceVariablePlaceholders({
  //       //     text: props.data.caption,
  //       //     ticketId: props.ticketId ?? "",
  //       //     businessName: fetchData.SectorsAttendants.Sectors?.Business.name,
  //       //     ticketProtocol: fetchData.protocol,
  //       //   });
  //       // }

  //       try {
  //         const path = resolve(
  //           __dirname,
  //           `../../../static/file/${fileFileName}`
  //         );
  //         const buffer = Buffer.from(props.data.base64, "base64");
  //         await writeFile(path, new Uint8Array(buffer));
  //         const mimetype = lookup(path);

  //         if (mimetype) {
  //           const message = await SendFile({
  //             connectionId: fetchData.connectionId,
  //             mimetype,
  //             document: buffer,
  //             originalName: props.data.fileName,
  //             toNumber:
  //               fetchData.ContactsWAOnAccount.ContactsWA.completeNumber.replace(
  //                 "+",
  //                 ""
  //               ) + "@s.whatsapp.net",
  //           });
  //           if (message) {
  //             const dataC = await prisma.conversationTickes.create({
  //               data: {
  //                 message: "",
  //                 fileName: fileFileName,
  //                 sentBy: "attendant",
  //                 type: props.data.type,
  //                 ticketsId: props.ticketId,
  //                 sectorsAttendantsId: props.userId,
  //                 messageKey: message.key.id,
  //               },
  //               select: { createAt: true, id: true },
  //             });
  //             socket.emit("synchronize-message", {
  //               ticketId: props.ticketId,
  //               data: {
  //                 type: "file",
  //                 clear: true,
  //                 fileName: fileFileName,
  //                 createAt: dataC.createAt,
  //                 id: dataC.id,
  //                 read: true,
  //                 sentBy: "attendant",
  //               },
  //             });
  //             if (stateUserHumanServide) {
  //               if (
  //                 !stateUserHumanServide.isMobile &&
  //                 stateUserHumanServide.linkedPages.includes("/kanban")
  //               ) {
  //                 socket.emit("synchronize-message-kanban", {
  //                   ticketId: props.ticketId,
  //                   kanbanId:
  //                     fetchData.StepsFunnelKanbanOnTickets[0].StepsFunnelKanban
  //                       .funnelKanbanId,
  //                   lastMsg: {
  //                     value: "🎤📷 Arquivo de midia",
  //                     date: dataC.createAt,
  //                   },
  //                 });
  //               }
  //             }
  //           }
  //         }
  //       } catch (error) {
  //         console.log("Não foi possivel salvar", error);
  //       }
  //       return;
  //     }
  //   });

  //   socket.on(
  //     "pick-ticket",
  //     async (props: { userId: number; ticketId: number }) => {
  //       const ticketExists = await prisma.tickets.findUnique({
  //         where: { id: props.ticketId, deleted: false },
  //         select: {
  //           status: true,
  //           connectionId: true,
  //           sectorsId: true,
  //           protocol: true,
  //           ContactsWAOnAccount: {
  //             select: {
  //               name: true,
  //               ContactsWA: { select: { completeNumber: true, img: true } },
  //               HumanServiceOnBusinessOnContactsWAOnAccount: {
  //                 select: {
  //                   _count: {
  //                     select: {
  //                       HumanServiceReportLead: {
  //                         where: { type: "pendency" },
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //           _count: {
  //             select: {
  //               ConversationTickes: { where: { sentBy: "lead", read: false } },
  //             },
  //           },
  //           ConversationTickes: {
  //             where: { sentBy: "lead" },
  //             orderBy: { id: "desc" },
  //             take: 1,
  //             select: { type: true, message: true, createAt: true, read: true },
  //           },
  //           Sectors: { select: { name: true, previewPhone: true, id: true } },
  //           Business: { select: { name: true } },
  //           sectorsAttendantsId: true,
  //           SectorsAttendants: {
  //             select: {
  //               id: true,
  //               name: true,
  //               office: true,
  //             },
  //           },
  //           StepsFunnelKanbanOnTickets: {
  //             select: {
  //               StepsFunnelKanban: {
  //                 select: { funnelKanbanId: true, id: true, sequence: true },
  //               },
  //             },
  //           },
  //         },
  //       });

  //       if (!ticketExists) {
  //         socket.emit("synchronize-ticket", {
  //           action: "delete" as TypeActionSynchronizeTicket,
  //           ticketId: props.ticketId,
  //         });
  //         const data: EmitNotifyToastMessage = {
  //           attendantId: props.userId,
  //           message: "Ticket não foi encontrado!",
  //           type: "error",
  //         };
  //         return socket.emit("notify-toast-message", data);
  //       }
  //       const hasConversation = !!ticketExists.ConversationTickes.length;
  //       if (
  //         ticketExists.sectorsAttendantsId &&
  //         ticketExists.sectorsAttendantsId !== props.userId
  //       ) {
  //         const data: EmitNotifyToastMessage = {
  //           attendantId: props.userId,
  //           message: "Você não pode abrir um ticket que já tem portador!",
  //           type: "error",
  //         };
  //         return socket.emit("notify-toast-message", data);
  //       }
  //       // aqui significa que está puxando um ticket que já é do proprio atendente
  //       // no if acima eu verifico se o atendente não é portador do ticket me questão
  //       // se ele já é portador e o ticket está como status OPEN, então libera
  //       if (ticketExists.status === "open") {
  //         const isDependence =
  //           ticketExists.ContactsWAOnAccount
  //             .HumanServiceOnBusinessOnContactsWAOnAccount?._count
  //             .HumanServiceReportLead ?? 0;
  //         const data: EmitPick = {
  //           id: props.ticketId,
  //           attendantId: props.userId,
  //           status: ticketExists.status,
  //           pendencies: isDependence,
  //           content: {
  //             countUnreadMsg: ticketExists._count.ConversationTickes,
  //             ...(hasConversation && {
  //               lastMsg: {
  //                 value: "🎤📷 Arquivo de midia",
  //                 ...(ticketExists.ConversationTickes[0].type === "text" && {
  //                   value: ticketExists.ConversationTickes[0].message,
  //                 }),
  //                 date: ticketExists.ConversationTickes[0].createAt,
  //               },
  //             }),
  //             sectorName: ticketExists.Sectors.name,
  //             businessName: ticketExists.Business.name,
  //             columnId:
  //               ticketExists.StepsFunnelKanbanOnTickets[0].StepsFunnelKanban.id,
  //             contactName: ticketExists.ContactsWAOnAccount.name,
  //             contactNumber:
  //               ticketExists.ContactsWAOnAccount.ContactsWA.completeNumber,
  //             contactImg: ticketExists.ContactsWAOnAccount.ContactsWA.img,
  //             protocol: ticketExists.protocol,
  //           },
  //         };
  //         socket.emit("synchronize-ticket", { ...data, action: "pick" });
  //         return;
  //       }
  //       if (ticketExists.status === "resolved") {
  //         socket.emit("synchronize-ticket", {
  //           action: "resolve" as TypeActionSynchronizeTicket,
  //           ...props,
  //           sectorId: ticketExists.connectionId,
  //         });
  //         return;
  //       }
  //       await prisma.tickets.update({
  //         where: { id: props.ticketId },
  //         data: { sectorsAttendantsId: props.userId, status: "open" },
  //       });
  //       const messageOpenTicket = await prisma.sectors.findFirst({
  //         where: {
  //           SectorsAttendants: { some: { id: props.userId } },
  //           Tickets: { some: { id: props.ticketId } },
  //         },
  //         select: {
  //           previewPhone: true,
  //           SectorsMessages: {
  //             select: {
  //               messageWelcomeToOpenTicket: true,
  //             },
  //           },
  //         },
  //       });
  //       if (messageOpenTicket?.SectorsMessages?.messageWelcomeToOpenTicket) {
  //         const message = await SendMessageText({
  //           connectionId: ticketExists.connectionId,
  //           text: messageOpenTicket.SectorsMessages.messageWelcomeToOpenTicket,
  //           toNumber:
  //             ticketExists.ContactsWAOnAccount.ContactsWA.completeNumber.replace(
  //               "+",
  //               ""
  //             ) + "@s.whatsapp.net",
  //         });
  //         if (message) {
  //           await prisma.conversationTickes.create({
  //             data: {
  //               message:
  //                 messageOpenTicket.SectorsMessages.messageWelcomeToOpenTicket,
  //               sentBy: "system",
  //               type: "text",
  //               ticketsId: props.ticketId,
  //               sectorsAttendantsId: props.userId,
  //               messageKey: message.key.id,
  //             },
  //           });
  //         } else {
  //           const data: EmitNotifyToastMessage = {
  //             attendantId: props.userId,
  //             ticketId: props.ticketId,
  //             message:
  //               "Não foi possível enviar a mensagem automática do setor. A equipe BotStudio foi notificada e já está cuidando do problema.!",
  //             type: "error",
  //             autoClose: 5000,
  //           };
  //           return socket.emit("notify-toast-message", data);
  //         }
  //       }
  //       const isDependence =
  //         ticketExists.ContactsWAOnAccount
  //           .HumanServiceOnBusinessOnContactsWAOnAccount?._count
  //           .HumanServiceReportLead ?? 0;

  //       const data: EmitPick = {
  //         id: props.ticketId,
  //         attendantId: props.userId,
  //         status: ticketExists.status,
  //         pendencies: isDependence,
  //         content: {
  //           countUnreadMsg: ticketExists._count.ConversationTickes,
  //           ...(hasConversation && {
  //             lastMsg: {
  //               value: "🎤📷 Arquivo de midia",
  //               ...(ticketExists.ConversationTickes[0].type === "text" && {
  //                 value: ticketExists.ConversationTickes[0].message,
  //               }),
  //               date: ticketExists.ConversationTickes[0].createAt,
  //             },
  //           }),
  //           sectorName: ticketExists.Sectors.name,
  //           businessName: ticketExists.Business.name,
  //           columnId:
  //             ticketExists.StepsFunnelKanbanOnTickets[0].StepsFunnelKanban.id,
  //           contactName: ticketExists.ContactsWAOnAccount.name,
  //           contactNumber:
  //             ticketExists.ContactsWAOnAccount.ContactsWA.completeNumber,
  //           protocol: ticketExists.protocol,
  //           contactImg: ticketExists.ContactsWAOnAccount.ContactsWA.img,
  //         },
  //       };
  //       socket.emit("insert-ticket-in-kanban-column", {
  //         attendant: ticketExists.SectorsAttendants!,
  //         columnId:
  //           ticketExists.StepsFunnelKanbanOnTickets[0].StepsFunnelKanban.id,
  //         kanbanId:
  //           ticketExists.StepsFunnelKanbanOnTickets[0].StepsFunnelKanban
  //             .funnelKanbanId,
  //         hasPendencie:
  //           !!ticketExists.ContactsWAOnAccount
  //             .HumanServiceOnBusinessOnContactsWAOnAccount?._count
  //             .HumanServiceReportLead,
  //         id: props.ticketId,
  //         sequence:
  //           ticketExists.StepsFunnelKanbanOnTickets[0].StepsFunnelKanban
  //             .sequence,
  //         content: {
  //           protocol: ticketExists.protocol,
  //           businessName: ticketExists.Business.name,
  //           contactImg: ticketExists.ContactsWAOnAccount.ContactsWA.img,
  //           contactName: ticketExists.ContactsWAOnAccount.name,
  //           contactNumber:
  //             ticketExists.ContactsWAOnAccount.ContactsWA.completeNumber,
  //           sectorName: ticketExists.Sectors.name,
  //           countUnreadMsg: ticketExists._count.ConversationTickes,
  //           ...(ticketExists.ConversationTickes.length && {
  //             lastMsg: {
  //               value: "🎤📷 Arquivo de midia",
  //               ...(ticketExists.ConversationTickes[0].type === "text" && {
  //                 value: ticketExists.ConversationTickes[0].message,
  //               }),
  //               date: ticketExists.ConversationTickes[0].createAt,
  //             },
  //           }),
  //         },
  //       });
  //       socket.emit("synchronize-ticket", { ...data, action: "pick" });
  //     }
  //   );

  //   socket.on(
  //     "resolve-ticket",
  //     async (props: { userId: number; ticketId: number }) => {
  //       const fetchData = await prisma.tickets.findUnique({
  //         where: { id: props.ticketId },
  //         select: {
  //           deleted: true,
  //           status: true,
  //           SectorsAttendants: {
  //             select: {
  //               id: true,
  //               office: true,
  //               name: true,
  //               Sectors: {
  //                 select: {
  //                   name: true,
  //                   signAttendant: true,
  //                   Business: { select: { name: true } },
  //                   signBusiness: true,
  //                   signSector: true,
  //                 },
  //               },
  //             },
  //           },
  //           connectionId: true,
  //           ContactsWAOnAccount: {
  //             select: { ContactsWA: { select: { completeNumber: true } } },
  //           },
  //         },
  //       });
  //       if (!fetchData) {
  //         socket.emit("synchronize-ticket", {
  //           action: "delete" as TypeActionSynchronizeTicket,
  //           ticketId: props.ticketId,
  //         });
  //         const data: EmitNotifyToastMessage = {
  //           attendantId: props.userId,
  //           message: "Ticket não foi encontrado!",
  //           type: "error",
  //         };
  //         return socket.emit("notify-toast-message", data);
  //       }

  //       if (fetchData?.deleted) {
  //         const message: EmitNotifyToastMessage = {
  //           attendantId: props.userId,
  //           message: "Não é possível resolver um ticket que foi apagado",
  //           type: "error",
  //           autoClose: 3000,
  //         };
  //         return socket.emit("notify-toast-message", message);
  //       }

  //       if (fetchData?.status !== "open") {
  //         const message: EmitNotifyToastMessage = {
  //           attendantId: props.userId,
  //           message: "Só é possível resolver tickets abertos",
  //           type: "error",
  //           autoClose: 3000,
  //         };
  //         return socket.emit("notify-toast-message", message);
  //       }

  //       if (fetchData.SectorsAttendants?.id !== props.userId) {
  //         const data: EmitNotifyToastMessage = {
  //           attendantId: props.userId,
  //           message: "Não é possível resolver ticket de outro portador",
  //           type: "error",
  //         };
  //         return socket.emit("notify-toast-message", data);
  //       }

  //       const messageOpenTicket = await prisma.sectors.findFirst({
  //         where: {
  //           SectorsAttendants: { some: { id: props.userId } },
  //           Tickets: { some: { id: props.ticketId } },
  //         },
  //         select: {
  //           SectorsMessages: {
  //             select: {
  //               messageFinishService: true,
  //             },
  //           },
  //         },
  //       });

  //       await prisma.tickets.update({
  //         where: { id: props.ticketId },
  //         data: { status: "resolved" },
  //       });

  //       if (messageOpenTicket?.SectorsMessages?.messageFinishService) {
  //         const message = await SendMessageText({
  //           connectionId: fetchData.connectionId,
  //           text: messageOpenTicket.SectorsMessages.messageFinishService,
  //           toNumber:
  //             fetchData.ContactsWAOnAccount.ContactsWA.completeNumber.replace(
  //               "+",
  //               ""
  //             ) + "@s.whatsapp.net",
  //         });
  //         if (message) {
  //           await prisma.conversationTickes.create({
  //             data: {
  //               message: messageOpenTicket.SectorsMessages.messageFinishService,
  //               sentBy: "system",
  //               type: "text",
  //               ticketsId: props.ticketId,
  //               sectorsAttendantsId: props.userId,
  //               messageKey: message.key.id,
  //             },
  //           });
  //         }
  //       }

  //       socket.emit("synchronize-ticket", {
  //         action: "resolve" as TypeActionSynchronizeTicket,
  //         ...props,
  //       });
  //     }
  //   );

  //   socket.on(
  //     "delete-ticket",
  //     async (props: { userId: number; ticketId: number }) => {
  //       const allowedAttendant = await prisma.sectorsAttendants.findUnique({
  //         where: { id: props.userId },
  //         select: {
  //           Sectors: {
  //             select: { removeTicket: true },
  //           },
  //         },
  //       });

  //       if (!allowedAttendant) {
  //         const data: EmitNotifyToastMessage = {
  //           attendantId: props.userId,
  //           ticketId: props.ticketId,
  //           message: "Não autorizado!",
  //           type: "error",
  //         };
  //         return socket.emit("notify-toast-message", data);
  //       }

  //       if (!allowedAttendant.Sectors?.removeTicket) {
  //         const data: EmitNotifyToastMessage = {
  //           attendantId: props.userId,
  //           ticketId: props.ticketId,
  //           message: "Sem permissão para deletar ticket",
  //           type: "error",
  //         };
  //         return socket.emit("notify-toast-message", data);
  //       }

  //       const ticketExists = await prisma.tickets.findUnique({
  //         where: { id: props.ticketId, deleted: false },
  //         select: { status: true },
  //       });
  //       if (ticketExists) {
  //         await prisma.tickets.update({
  //           where: { id: props.ticketId, sectorsAttendantsId: props.userId },
  //           data: { status: "resolved", deleted: true },
  //         });
  //         socket.emit("synchronize-ticket", {
  //           action: "delete" as TypeActionSynchronizeTicket,
  //           ticketId: props.ticketId,
  //           status: ticketExists.status,
  //         });
  //       }
  //     }
  //   );

  //   socket.on(
  //     "return-ticket",
  //     async (props: { userId: number; ticketId: number }) => {
  //       const fetchData = await prisma.tickets.findUnique({
  //         where: { id: props.ticketId },
  //         select: {
  //           destination: true,
  //           protocol: true,
  //           businessId: true,
  //           Business: { select: { name: true } },
  //           status: true,
  //           destinationSectorsAttendantsId: true,
  //           deleted: true,
  //           Sectors: {
  //             select: {
  //               id: true,
  //               name: true,
  //               signAttendant: true,
  //               signBusiness: true,
  //               signSector: true,
  //             },
  //           },
  //           SectorsAttendants: {
  //             select: { id: true, office: true, name: true },
  //           },
  //           connectionId: true,
  //           ContactsWAOnAccount: {
  //             select: {
  //               name: true,
  //               ContactsWA: { select: { completeNumber: true, img: true } },
  //               HumanServiceOnBusinessOnContactsWAOnAccount: {
  //                 select: {
  //                   _count: {
  //                     select: {
  //                       HumanServiceReportLead: {
  //                         where: { type: "pendency" },
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //           _count: {
  //             select: {
  //               ConversationTickes: { where: { sentBy: "lead", read: false } },
  //             },
  //           },
  //           ConversationTickes: {
  //             // where: { sentBy: "lead" },
  //             orderBy: { id: "desc" },
  //             take: 1,
  //             select: { type: true, message: true, createAt: true, read: true },
  //           },
  //         },
  //       });
  //       if (!fetchData) {
  //         const message: EmitNotifyToastMessage = {
  //           attendantId: props.userId,
  //           message: "Não foi possível retornar ticket. Ticket não encontrado",
  //           type: "error",
  //           autoClose: 3000,
  //         };
  //         return socket.emit("notify-toast-message", message);
  //       }

  //       if (fetchData?.deleted) {
  //         const message: EmitNotifyToastMessage = {
  //           attendantId: props.userId,
  //           message: "Não é possível retornar um ticket que foi apagado",
  //           type: "error",
  //           autoClose: 3000,
  //         };
  //         return socket.emit("notify-toast-message", message);
  //       }

  //       if (fetchData?.status !== "open") {
  //         const message: EmitNotifyToastMessage = {
  //           attendantId: props.userId,
  //           message: "Só é possível retornar tickets abertos",
  //           type: "error",
  //           autoClose: 3000,
  //         };
  //         return socket.emit("notify-toast-message", message);
  //       }

  //       if (fetchData?.SectorsAttendants?.id !== props.userId) {
  //         const message: EmitNotifyToastMessage = {
  //           attendantId: props.userId,
  //           message: "Não é possível retornar ticket de outro portador",
  //           type: "error",
  //           autoClose: 3000,
  //         };
  //         return socket.emit("notify-toast-message", message);
  //       }

  //       const messageOpenTicket = await prisma.sectors.findFirst({
  //         where: {
  //           SectorsAttendants: { some: { id: props.userId } },
  //           Tickets: { some: { id: props.ticketId } },
  //         },
  //         select: { SectorsMessages: { select: { messageWelcome: true } } },
  //       });

  //       await prisma.tickets.update({
  //         where: { id: props.ticketId },
  //         data: { status: "new", sectorsAttendantsId: null },
  //       });

  //       if (messageOpenTicket?.SectorsMessages?.messageWelcome) {
  //         const message = await SendMessageText({
  //           connectionId: fetchData.connectionId,
  //           text: messageOpenTicket.SectorsMessages.messageWelcome,
  //           toNumber:
  //             fetchData.ContactsWAOnAccount.ContactsWA.completeNumber +
  //             "@s.whatsapp.net",
  //         });
  //         if (message) {
  //           await prisma.conversationTickes.create({
  //             data: {
  //               message: messageOpenTicket.SectorsMessages.messageWelcome,
  //               sentBy: "system",
  //               type: "text",
  //               ticketsId: props.ticketId,
  //               sectorsAttendantsId: props.userId,
  //               messageKey: message.key.id,
  //             },
  //           });
  //         }
  //       }
  //       const isDependence =
  //         fetchData.ContactsWAOnAccount
  //           .HumanServiceOnBusinessOnContactsWAOnAccount?._count
  //           .HumanServiceReportLead;

  //       const data: CardTicket = {
  //         id: props.ticketId,
  //         destination: fetchData.destination,
  //         insertSteps: ["all", "pending"],
  //         status: "new",
  //         sectorId: fetchData.Sectors.id,
  //         ...(fetchData._count.ConversationTickes && { color: "#dc3545" }),
  //         ...(isDependence && { color: "#fd7e14" }),
  //         color: "#ffc107",
  //         content: {
  //           businessName: fetchData.Business.name,
  //           contactImg: fetchData.ContactsWAOnAccount.ContactsWA.img,
  //           contactName: fetchData.ContactsWAOnAccount.name,
  //           sectorName: fetchData.Sectors.name,
  //           countUnreadMsg: fetchData._count.ConversationTickes,
  //           ...(fetchData.ConversationTickes.length && {
  //             lastMsg: {
  //               value: "🎤📷 Arquivo de midia",
  //               ...(fetchData.ConversationTickes[0].type === "text" && {
  //                 value: fetchData.ConversationTickes[0].message,
  //               }),
  //               date: fetchData.ConversationTickes[0].createAt,
  //             },
  //           }),
  //         },
  //       };

  //       socket.emit("synchronize-ticket", {
  //         action: "return" as TypeActionSynchronizeTicket,
  //         ...data,
  //       });
  //       socket.emit("notify-toast-new_ticket", {
  //         destination: data.destination,
  //         sectorId: data.sectorId,
  //         ...(data.destination === "attendant" && {
  //           attendantId: data.attendantId,
  //         }),
  //       });
  //     }
  //   );

  //   // socket.on(
  //   //   "transfer-ticket",
  //   //   async (props: {
  //   //     ticketId: number;
  //   //     sectorId: number;
  //   //     sectorAttendantId?: number;
  //   //     type: "attendant" | "sector";
  //   //     userId: number;
  //   //   }) => {
  //   //     const fetchData = await prisma.tickets.findUnique({
  //   //       where: { id: props.ticketId, sectorsAttendantsId: props.userId },
  //   //       select: {
  //   //         destination: true,
  //   //         sectorsId: true,
  //   //         protocol: true,
  //   //         SectorsAttendants: {
  //   //           select: {
  //   //             sectorsId: true,
  //   //             Sectors: {
  //   //               select: {
  //   //                 name: true,
  //   //                 signAttendant: true,
  //   //                 Business: { select: { name: true } },
  //   //                 SectorsMessages: {
  //   //                   select: { messageTransferTicket: true },
  //   //                 },
  //   //                 signBusiness: true,
  //   //                 signSector: true,
  //   //               },
  //   //             },
  //   //           },
  //   //         },
  //   //         connectionId: true,
  //   //         ConversationTickes: {
  //   //           orderBy: { id: "desc" },
  //   //           take: 1,
  //   //           select: { createAt: true },
  //   //         },
  //   //         ContactsWAOnAccount: {
  //   //           select: {
  //   //             ContactsWA: { select: { completeNumber: true } },
  //   //             name: true,
  //   //           },
  //   //         },
  //   //       },
  //   //     });
  //   //     if (fetchData) {
  //   //       const connection = sessionsBaileysWA.get(fetchData.connectionId);
  //   //       if (!connection) return;

  //   //       if (props.type === "sector") {
  //   //         await prisma.tickets.update({
  //   //           where: { id: props.ticketId },
  //   //           data: {
  //   //             status: "new",
  //   //             sectorsAttendantsId: null,
  //   //             destination: "sector",
  //   //             sectorsId: props.sectorId,
  //   //           },
  //   //         });
  //   //       }
  //   //       if (props.type === "attendant" && !props.sectorAttendantId) return;
  //   //       if (props.type === "attendant") {
  //   //         await prisma.tickets.update({
  //   //           where: { id: props.ticketId },
  //   //           data: {
  //   //             status: "new",
  //   //             sectorsAttendantsId: null,
  //   //             destination: "attendant",
  //   //             sectorsId: props.sectorId,
  //   //             destinationSectorsAttendantsId: props.sectorAttendantId,
  //   //           },
  //   //         });
  //   //       }

  //   //       const messageTransfer =
  //   //         fetchData.SectorsAttendants?.Sectors?.SectorsMessages
  //   //           ?.messageTransferTicket;
  //   //       if (messageTransfer) {
  //   //         const message = await connection.sendMessage(
  //   //           fetchData.ContactsWAOnAccount.ContactsWA.completeNumber.replace(
  //   //             "+",
  //   //             ""
  //   //           ) + "@s.whatsapp.net",
  //   //           { text: messageTransfer }
  //   //         );
  //   //         if (message) {
  //   //           await prisma.conversationTickes.create({
  //   //             data: {
  //   //               message: messageTransfer,
  //   //               sentBy: "system",
  //   //               type: "text",
  //   //               ticketsId: props.ticketId,
  //   //               sectorsAttendantsId: props.userId,
  //   //               messageKey: message.key.id,
  //   //             },
  //   //           });
  //   //         }
  //   //       }

  //   //       socket.emit("synchronize-ticket", {
  //   //         action: "transfer" as TypeActionSynchronizeTicket,
  //   //         ticketId: props.ticketId,
  //   //         sectorAttendantDestinationId: props.sectorAttendantId,
  //   //         destination: fetchData.destination,
  //   //         sectorId: fetchData.sectorsId,
  //   //         protocol: fetchData.protocol,
  //   //         businessName: fetchData.SectorsAttendants?.Sectors?.Business.name,
  //   //         contactName: fetchData.ContactsWAOnAccount.name,
  //   //         contactNumber:
  //   //           fetchData.ContactsWAOnAccount.ContactsWA.completeNumber,
  //   //         sectorName: fetchData.SectorsAttendants?.Sectors?.name,
  //   //         countUnreadMsg: 0,
  //   //         lastDateMsg: fetchData.ConversationTickes.length
  //   //           ? moment(fetchData.ConversationTickes[0].createAt)
  //   //               .tz("America/Sao_Paulo")
  //   //               .format("DD/MM/YYYY")
  //   //           : undefined,
  //   //         sectorsAttendantsId: null,
  //   //       });
  //   //     }
  //   //   }
  //   // );

  //   socket.on(
  //     "reopen-ticket",
  //     async (props: { userId: number; ticketId: number }) => {
  //       const ticketExists = await prisma.tickets.findUnique({
  //         where: { id: props.ticketId, deleted: false },
  //         select: {
  //           status: true,
  //           connectionId: true,
  //           sectorsId: true,
  //           protocol: true,
  //           ContactsWAOnAccount: {
  //             select: {
  //               name: true,
  //               ContactsWA: { select: { completeNumber: true, img: true } },
  //               HumanServiceOnBusinessOnContactsWAOnAccount: {
  //                 select: {
  //                   _count: {
  //                     select: {
  //                       HumanServiceReportLead: {
  //                         where: { type: "pendency" },
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //           _count: {
  //             select: {
  //               ConversationTickes: { where: { sentBy: "lead", read: false } },
  //             },
  //           },
  //           ConversationTickes: {
  //             where: { sentBy: "lead" },
  //             orderBy: { id: "desc" },
  //             take: 1,
  //             select: { type: true, message: true, createAt: true, read: true },
  //           },
  //           Sectors: { select: { name: true, previewPhone: true, id: true } },
  //           Business: { select: { name: true } },
  //           sectorsAttendantsId: true,
  //           StepsFunnelKanbanOnTickets: {
  //             where: { ticketsId: props.ticketId },
  //             select: {
  //               StepsFunnelKanban: { select: { id: true, sequence: true } },
  //             },
  //           },
  //         },
  //       });
  //       if (!ticketExists) {
  //         socket.emit("synchronize-ticket", {
  //           action: "delete" as TypeActionSynchronizeTicket,
  //           ticketId: props.ticketId,
  //         });
  //         const data: EmitNotifyToastMessage = {
  //           attendantId: props.userId,
  //           message: "Ticket não foi encontrado!",
  //           type: "error",
  //         };
  //         return socket.emit("notify-toast-message", data);
  //       }
  //       const hasConversation = !!ticketExists.ConversationTickes.length;

  //       await prisma.tickets.update({
  //         where: { id: props.ticketId },
  //         data: { sectorsAttendantsId: props.userId, status: "open" },
  //       });

  //       const messageOpenTicket = await prisma.sectors.findFirst({
  //         where: {
  //           SectorsAttendants: { some: { id: props.userId } },
  //           Tickets: { some: { id: props.ticketId } },
  //         },
  //         select: {
  //           previewPhone: true,
  //           SectorsMessages: { select: { messageWelcomeToOpenTicket: true } },
  //         },
  //       });
  //       try {
  //         if (messageOpenTicket?.SectorsMessages?.messageWelcomeToOpenTicket) {
  //           const message = await SendMessageText({
  //             connectionId: ticketExists.connectionId,
  //             toNumber:
  //               ticketExists.ContactsWAOnAccount.ContactsWA.completeNumber +
  //               "@s.whatsapp.net",
  //             text: messageOpenTicket.SectorsMessages
  //               .messageWelcomeToOpenTicket,
  //           });
  //           if (message) {
  //             await prisma.conversationTickes.create({
  //               data: {
  //                 message:
  //                   messageOpenTicket.SectorsMessages
  //                     .messageWelcomeToOpenTicket,
  //                 sentBy: "system",
  //                 type: "text",
  //                 ticketsId: props.ticketId,
  //                 sectorsAttendantsId: props.userId,
  //                 messageKey: message?.key.id,
  //               },
  //             });
  //           } else {
  //             const data: EmitNotifyToastMessage = {
  //               attendantId: props.userId,
  //               ticketId: props.ticketId,
  //               message:
  //                 "Não foi possível enviar a mensagem automática do setor. A equipe BotStudio foi notificada e já está cuidando do problema.!",
  //               type: "error",
  //               autoClose: 5000,
  //             };
  //             return socket.emit("notify-toast-message", data);
  //           }
  //         }
  //         const isDependence =
  //           ticketExists.ContactsWAOnAccount
  //             .HumanServiceOnBusinessOnContactsWAOnAccount?._count
  //             .HumanServiceReportLead ?? 0;

  //         const data: EmitPick = {
  //           id: props.ticketId,
  //           attendantId: props.userId,
  //           status: ticketExists.status,
  //           pendencies: isDependence,
  //           content: {
  //             countUnreadMsg: ticketExists._count.ConversationTickes,
  //             ...(hasConversation && {
  //               lastMsg: {
  //                 value: "🎤📷 Arquivo de midia",
  //                 ...(ticketExists.ConversationTickes[0].type === "text" && {
  //                   value: ticketExists.ConversationTickes[0].message,
  //                 }),
  //                 date: ticketExists.ConversationTickes[0].createAt,
  //               },
  //             }),
  //             sectorName: ticketExists.Sectors.name,
  //             businessName: ticketExists.Business.name,
  //             columnId:
  //               ticketExists.StepsFunnelKanbanOnTickets[0].StepsFunnelKanban.id,
  //             contactName: ticketExists.ContactsWAOnAccount.name,
  //             contactNumber:
  //               ticketExists.ContactsWAOnAccount.ContactsWA.completeNumber,
  //             protocol: ticketExists.protocol,
  //             contactImg: ticketExists.ContactsWAOnAccount.ContactsWA.img,
  //           },
  //         };
  //         socket.emit("synchronize-ticket", { ...data, action: "pick" });
  //       } catch (error) {
  //         await prisma.tickets.update({
  //           where: { id: props.ticketId },
  //           data: { sectorsAttendantsId: null, status: "resolved" },
  //         });
  //         const data: EmitNotifyToastMessage = {
  //           attendantId: props.userId,
  //           ticketId: props.ticketId,
  //           message:
  //             "Não foi possível re-abrir ticket, a conexão não existe ou está desligada!",
  //           type: "error",
  //         };
  //         return socket.emit("notify-toast-message", data);
  //       }
  //       // socket.emit("synchronize-ticket", {
  //       //   action: "reopen-ticket" as TypeActionSynchronizeTicket,
  //       //   ...props,
  //       //   sectorId: ticket.sectorsId,
  //       //   ...(messageOpenTicket?.previewPhone && {
  //       //     numberLead: ticket.ContactsWAOnAccount.ContactsWA.completeNumber,
  //       //   }),
  //       //   protocol: ticket.protocol,
  //       //   status: "open",
  //       //   businessName: ticket.Business.name,
  //       //   contactName: ticket.ContactsWAOnAccount.name,
  //       //   contactNumber: ticket.ContactsWAOnAccount.ContactsWA.completeNumber,
  //       //   sectorsAttendantsId: props.userId,
  //       //   stepKanbanId:
  //       //     ticket.StepsFunnelKanbanOnTickets[0]?.StepsFunnelKanban.id ?? null,
  //       //   humanServiceOnBusinessOnContactsWAOnAccountId:
  //       //     ticket.ContactsWAOnAccount
  //       //       .HumanServiceOnBusinessOnContactsWAOnAccount!.id,
  //       // });
  //     }
  //   );
  // });
};

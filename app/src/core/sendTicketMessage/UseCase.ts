import { resolve } from "path";
import { SendMessageText } from "../../adapters/Baileys/modules/sendMessage";
import { prisma } from "../../adapters/Prisma/client";
import { socketIo } from "../../infra/express";
import { cacheAccountSocket } from "../../infra/websocket/cache";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { SendTicketMessageDTO_I } from "./DTO";
import { lookup } from "mime-types";
import { resolveTextVariables } from "../../libs/FlowBuilder/utils/ResolveTextVariables";
import { SendFile } from "../../adapters/Baileys/modules/sendFile";
import { readFileSync } from "fs-extra";
import { SendImage } from "../../adapters/Baileys/modules/sendImage";
import { SendVideo } from "../../adapters/Baileys/modules/sendVideo";
import { SendAudio } from "../../adapters/Baileys/modules/sendAudio";

let path = "";
if (process.env.NODE_ENV === "production") {
  path = resolve(__dirname, "../static/storage");
} else {
  path = resolve(__dirname, "../../../static/storage");
}

export class SendTicketMessageUseCase {
  constructor() {}

  async run({ ...dto }: SendTicketMessageDTO_I) {
    const exist = await prisma.tickets.findFirst({
      where: {
        id: dto.id,
        ...(dto.accountId && { accountId: dto.accountId }),
        status: "OPEN",
      },
      select: {
        accountId: true,
        connectionWAId: true,
        InboxDepartment: { select: { name: true, id: true, businessId: true } },
        ContactsWAOnAccount: {
          select: {
            name: true,
            id: true,
            ContactsWA: { select: { completeNumber: true } },
          },
        },
        updateAt: true,
      },
    });

    if (!exist) {
      throw new ErrorResponse(400).container(
        "Não foi possivel encontrar o ticket."
      );
    }

    const { InboxDepartment, ContactsWAOnAccount, updateAt } = exist;

    const nameSpace = socketIo.of(
      `/business-${InboxDepartment.businessId}/inbox`
    );

    if (dto.type === "text") {
      let messageId = 0;
      let lastInteractionDate: null | Date = null;
      try {
        const msg = await SendMessageText({
          connectionId: exist.connectionWAId,
          text: dto.text,
          toNumber:
            ContactsWAOnAccount.ContactsWA.completeNumber + "@s.whatsapp.net",
        });
        if (!msg?.key?.id) {
          throw new ErrorResponse(500).toast({
            title: "Erro ao enviar mensagem.",
            description: "Não foi possível enviar a mensagem.",
            type: "error",
          });
        }
        const { id: msgId, createAt } = await prisma.messages.create({
          data: {
            by: "user",
            type: "text",
            message: dto.text,
            ticketsId: dto.id,
            messageKey: msg.key.id,
          },
          select: { id: true, createAt: true },
        });
        lastInteractionDate = createAt;
        messageId = msgId;
        if (dto.accountId) {
          cacheAccountSocket
            .get(dto.accountId)
            ?.listSocket?.forEach((sockId) => {
              // isso é só se caso o contato enviar mensagem para o ticket.
              // socketIo.to(sockId).emit(`inbox`, {
              //   accountId: dto.accountId,
              //   departmentId: InboxDepartment.id,
              //   departmentName: InboxDepartment.name,
              //   status: "MESSAGE",
              //   notifyMsc: true,
              //   notifyToast: true,
              //   id: dto.id,
              // });

              nameSpace.emit("message-list", {
                content: {
                  id: msgId,
                  type: "text",
                  text: dto.text,
                },
                by: "contact",
                departmentId: InboxDepartment.id,
                notifyMsc: false,
                notifyToast: false,
                ticketId: dto.id,
                userId: dto.userId, // caso seja enviado para um usuário.
                lastInteractionDate: createAt,
                read: true,
              });

              nameSpace.emit("message", {
                content: {
                  id: messageId,
                  text: dto.text,
                  type: "text",
                },
                by: "user",
                departmentId: InboxDepartment.id,
                notifyMsc: false,
                notifyToast: false,
                ticketId: dto.id,
                userId: undefined, // caso seja enviado para um usuário.
                lastInteractionDate: lastInteractionDate!,
              });
            });
        }
      } catch (error) {
        console.error("Error sending message:", error);
        throw new ErrorResponse(500).toast({
          title: "Erro na conexão ao tentar enviar a mensagem.",
          description: "Por favor, verifique a conexão com o WhatsApp.",
          type: "error",
        });
      }
    } else {
      const files = dto.files || [];
      if (!files.length) {
        throw new ErrorResponse(400).container(
          "É necessário enviar pelo menos um arquivo."
        );
      }

      const firstFile = files.shift();
      if (firstFile) {
        const e = await prisma.storagePaths.findFirst({
          where: { id: firstFile.id, accountId: exist.accountId },
          select: { fileName: true, originalName: true },
        });

        if (e) {
          const urlStatic = `${path}/${e.fileName}`;
          const mimetype = lookup(urlStatic);
          let caption = "";

          if ((dto.type === "file" || dto.type === "image") && dto.text) {
            caption = await resolveTextVariables({
              accountId: exist.accountId,
              contactsWAOnAccountId: exist.ContactsWAOnAccount.id,
              text: dto.text,
              // ticketProtocol: props.ticketProtocol,
              numberLead: exist.ContactsWAOnAccount.ContactsWA.completeNumber,
            });
          }
          if (dto.type === "file") {
            try {
              const msg = await SendFile({
                connectionId: exist.connectionWAId,
                originalName: e.originalName,
                toNumber:
                  exist.ContactsWAOnAccount.ContactsWA.completeNumber +
                  "@s.whatsapp.net",
                caption,
                document: readFileSync(urlStatic),
                mimetype: mimetype || undefined,
              });
              if (!msg?.key?.id) {
                throw new ErrorResponse(500).toast({
                  title: "Erro ao enviar mensagem.",
                  description: "Não foi possível enviar a mensagem.",
                  type: "error",
                });
              }
              const { id: msgId, createAt } = await prisma.messages.create({
                data: {
                  by: "user",
                  type: "file",
                  caption,
                  message: "",
                  fileName: e.fileName,
                  ticketsId: dto.id,
                  messageKey: msg.key.id,
                },
                select: { id: true, createAt: true },
              });
              if (dto.accountId) {
                cacheAccountSocket
                  .get(dto.accountId)
                  ?.listSocket?.forEach((sockId) => {
                    // isso é só se caso o contato enviar mensagem para o ticket.
                    // socketIo.to(sockId).emit(`inbox`, {
                    //   accountId: dto.accountId,
                    //   departmentId: InboxDepartment.id,
                    //   departmentName: InboxDepartment.name,
                    //   status: "MESSAGE",
                    //   notifyMsc: true,
                    //   notifyToast: true,
                    //   id: dto.id,
                    // });
                    nameSpace.emit("message-list", {
                      content: { id: msgId, type: "file" },
                      by: "contact",
                      departmentId: InboxDepartment.id,
                      notifyMsc: false,
                      notifyToast: false,
                      ticketId: dto.id,
                      userId: dto.userId, // caso seja enviado para um usuário.
                      lastInteractionDate: createAt,
                      read: true,
                    });
                    nameSpace.emit("message", {
                      content: {
                        id: msgId,
                        type: "file",
                        caption,
                        fileName: e.fileName,
                      },
                      by: "user",
                      departmentId: InboxDepartment.id,
                      notifyMsc: false,
                      notifyToast: false,
                      ticketId: dto.id,
                      userId: dto.userId, // caso seja enviado para um usuário.
                      lastInteractionDate: createAt,
                    });
                  });
              }
            } catch (error) {
              console.log(error);
              throw new ErrorResponse(500).toast({
                title: "Erro ao enviar arquivo.",
                description: "Não foi possível enviar o arquivo.",
                type: "error",
              });
            }
          }
          if (dto.type === "image") {
            try {
              if (!mimetype) {
                throw new ErrorResponse(400).container(
                  "Tipo de arquivo inválido. Por favor, envie uma imagem."
                );
              }
              if (/^image\//.test(mimetype)) {
                const msg = await SendImage({
                  connectionId: exist.connectionWAId,
                  url: urlStatic,
                  toNumber:
                    exist.ContactsWAOnAccount.ContactsWA.completeNumber +
                    "@s.whatsapp.net",
                  caption,
                });
                if (!msg?.key?.id) {
                  throw new ErrorResponse(500).toast({
                    title: "Erro ao enviar imagem.",
                    description: "Não foi possível enviar a imagem.",
                    type: "error",
                  });
                }
                const { id: msgId, createAt } = await prisma.messages.create({
                  data: {
                    by: "user",
                    type: "image",
                    caption,
                    message: "",
                    fileName: e.fileName,
                    ticketsId: dto.id,
                    messageKey: msg.key.id,
                  },
                  select: { id: true, createAt: true },
                });
                if (dto.accountId) {
                  cacheAccountSocket
                    .get(dto.accountId)
                    ?.listSocket?.forEach((sockId) => {
                      // isso é só se caso o contato enviar mensagem para o ticket.
                      // socketIo.to(sockId).emit(`inbox`, {
                      //   accountId: dto.accountId,
                      //   departmentId: InboxDepartment.id,
                      //   departmentName: InboxDepartment.name,
                      //   status: "MESSAGE",
                      //   notifyMsc: true,
                      //   notifyToast: true,
                      //   id: dto.id,
                      // });
                      nameSpace.emit("message-list", {
                        content: { id: msgId, type: "image" },
                        by: "contact",
                        departmentId: InboxDepartment.id,
                        notifyMsc: false,
                        notifyToast: false,
                        ticketId: dto.id,
                        userId: dto.userId, // caso seja enviado para um usuário.
                        lastInteractionDate: createAt,
                        read: true,
                      });
                      nameSpace.emit("message", {
                        content: {
                          id: msgId,
                          type: "image",
                          caption,
                          fileName: e.fileName,
                        },
                        by: "user",
                        departmentId: InboxDepartment.id,
                        notifyMsc: false,
                        notifyToast: false,
                        ticketId: dto.id,
                        userId: dto.userId, // caso seja enviado para um usuário.
                        lastInteractionDate: createAt,
                      });
                    });
                }
              }
              if (/^video\//.test(mimetype)) {
                const msg = await SendVideo({
                  connectionId: exist.connectionWAId,
                  toNumber:
                    exist.ContactsWAOnAccount.ContactsWA.completeNumber +
                    "@s.whatsapp.net",
                  caption,
                  video: readFileSync(urlStatic),
                  mimetype: mimetype || undefined,
                });
                if (!msg?.key?.id) {
                  throw new ErrorResponse(500).toast({
                    title: "Erro ao enviar video.",
                    description: "Não foi possível enviar a video.",
                    type: "error",
                  });
                }
                const { id: msgId, createAt } = await prisma.messages.create({
                  data: {
                    by: "user",
                    type: "video",
                    caption,
                    message: "",
                    fileName: e.fileName,
                    ticketsId: dto.id,
                    messageKey: msg.key.id,
                  },
                  select: { id: true, createAt: true },
                });
                if (dto.accountId) {
                  cacheAccountSocket
                    .get(dto.accountId)
                    ?.listSocket?.forEach((sockId) => {
                      // isso é só se caso o contato enviar mensagem para o ticket.
                      // socketIo.to(sockId).emit(`inbox`, {
                      //   accountId: dto.accountId,
                      //   departmentId: InboxDepartment.id,
                      //   departmentName: InboxDepartment.name,
                      //   status: "MESSAGE",
                      //   notifyMsc: true,
                      //   notifyToast: true,
                      //   id: dto.id,
                      // });
                      nameSpace.emit("message-list", {
                        content: { id: msgId, type: "video" },
                        by: "contact",
                        departmentId: InboxDepartment.id,
                        notifyMsc: false,
                        notifyToast: false,
                        ticketId: dto.id,
                        userId: dto.userId, // caso seja enviado para um usuário.
                        lastInteractionDate: createAt,
                        read: true,
                      });
                      nameSpace.emit("message", {
                        content: {
                          id: msgId,
                          type: "video",
                          caption,
                          fileName: e.fileName,
                        },
                        by: "user",
                        departmentId: InboxDepartment.id,
                        notifyMsc: false,
                        notifyToast: false,
                        ticketId: dto.id,
                        userId: dto.userId, // caso seja enviado para um usuário.
                        lastInteractionDate: createAt,
                      });
                    });
                }
              }
            } catch (error) {
              throw new ErrorResponse(500).toast({
                title: "Erro ao enviar imagem.",
                description: "Não foi possível enviar a imagem.",
                type: "error",
              });
            }
          }
          if (dto.type === "audio") {
            const msg = await SendAudio({
              connectionId: exist.connectionWAId,
              toNumber:
                exist.ContactsWAOnAccount.ContactsWA.completeNumber +
                "@s.whatsapp.net",
              urlStatic: urlStatic,
              ptt: firstFile.type === "audio",
              mimetype: mimetype || undefined,
            });
            if (!msg?.key?.id) {
              throw new ErrorResponse(500).toast({
                title: "Erro ao enviar imagem.",
                description: "Não foi possível enviar a audio.",
                type: "error",
              });
            }
            const { id: msgId, createAt } = await prisma.messages.create({
              data: {
                by: "user",
                type: "audio",
                ptt: firstFile.type === "audio",
                message: "",
                fileName: e.fileName,
                ticketsId: dto.id,
                messageKey: msg.key.id,
              },
              select: { id: true, createAt: true },
            });
            if (dto.accountId) {
              cacheAccountSocket
                .get(dto.accountId)
                ?.listSocket?.forEach((sockId) => {
                  // isso é só se caso o contato enviar mensagem para o ticket.
                  // socketIo.to(sockId).emit(`inbox`, {
                  //   accountId: dto.accountId,
                  //   departmentId: InboxDepartment.id,
                  //   departmentName: InboxDepartment.name,
                  //   status: "MESSAGE",
                  //   notifyMsc: true,
                  //   notifyToast: true,
                  //   id: dto.id,
                  // });
                  nameSpace.emit("message-list", {
                    content: { id: msgId, type: "audio" },
                    by: "contact",
                    departmentId: InboxDepartment.id,
                    notifyMsc: false,
                    notifyToast: false,
                    ticketId: dto.id,
                    userId: dto.userId, // caso seja enviado para um usuário.
                    lastInteractionDate: createAt,
                    read: true,
                  });
                  nameSpace.emit("message", {
                    content: {
                      id: msgId,
                      type: "audio",
                      fileName: e.fileName,
                      ptt: firstFile.type === "audio",
                    },
                    by: "user",
                    departmentId: InboxDepartment.id,
                    notifyMsc: false,
                    notifyToast: false,
                    ticketId: dto.id,
                    userId: dto.userId, // caso seja enviado para um usuário.
                    lastInteractionDate: createAt,
                  });
                });
            }
          }
        }
      }

      for await (const file of files) {
        const e = await prisma.storagePaths.findFirst({
          where: { id: file.id, accountId: exist.accountId },
          select: { fileName: true, originalName: true },
        });

        if (e) {
          const urlStatic = `${path}/${e.fileName}`;
          const mimetype = lookup(urlStatic);
          let caption = "";

          if ((dto.type === "file" || dto.type === "image") && dto.text) {
            caption = await resolveTextVariables({
              accountId: exist.accountId,
              contactsWAOnAccountId: exist.ContactsWAOnAccount.id,
              text: dto.text,
              // ticketProtocol: props.ticketProtocol,
              numberLead: exist.ContactsWAOnAccount.ContactsWA.completeNumber,
            });
          }
          if (dto.type === "file") {
            try {
              const msg = await SendFile({
                connectionId: exist.connectionWAId,
                originalName: e.originalName,
                toNumber:
                  exist.ContactsWAOnAccount.ContactsWA.completeNumber +
                  "@s.whatsapp.net",
                caption,
                document: readFileSync(urlStatic),
                mimetype: mimetype || undefined,
              });
              if (!msg?.key?.id) {
                throw new ErrorResponse(500).toast({
                  title: "Erro ao enviar mensagem.",
                  description: "Não foi possível enviar a mensagem.",
                  type: "error",
                });
              }
              const { id: msgId, createAt } = await prisma.messages.create({
                data: {
                  by: "user",
                  type: "file",
                  caption,
                  message: "",
                  fileName: e.fileName,
                  ticketsId: dto.id,
                  messageKey: msg.key.id,
                },
                select: { id: true, createAt: true },
              });
              if (dto.accountId) {
                cacheAccountSocket
                  .get(dto.accountId)
                  ?.listSocket?.forEach((sockId) => {
                    // isso é só se caso o contato enviar mensagem para o ticket.
                    // socketIo.to(sockId).emit(`inbox`, {
                    //   accountId: dto.accountId,
                    //   departmentId: InboxDepartment.id,
                    //   departmentName: InboxDepartment.name,
                    //   status: "MESSAGE",
                    //   notifyMsc: true,
                    //   notifyToast: true,
                    //   id: dto.id,
                    // });
                    nameSpace.emit("message-list", {
                      content: { id: msgId, type: "file" },
                      by: "contact",
                      departmentId: InboxDepartment.id,
                      notifyMsc: false,
                      notifyToast: false,
                      ticketId: dto.id,
                      userId: dto.userId, // caso seja enviado para um usuário.
                      lastInteractionDate: createAt,
                      read: true,
                    });
                    nameSpace.emit("message", {
                      content: {
                        id: msgId,
                        type: "file",
                        caption,
                        fileName: e.fileName,
                      },
                      by: "user",
                      departmentId: InboxDepartment.id,
                      notifyMsc: false,
                      notifyToast: false,
                      ticketId: dto.id,
                      userId: dto.userId, // caso seja enviado para um usuário.
                      lastInteractionDate: createAt,
                    });
                  });
              }
            } catch (error) {
              throw new ErrorResponse(500).toast({
                title: "Erro ao enviar arquivo.",
                description: "Não foi possível enviar o arquivo.",
                type: "error",
              });
            }
          }
          if (dto.type === "image") {
            try {
              if (!mimetype) {
                throw new ErrorResponse(400).container(
                  "Tipo de arquivo inválido. Por favor, envie uma imagem."
                );
              }
              if (/^image\//.test(mimetype)) {
                const msg = await SendImage({
                  connectionId: exist.connectionWAId,
                  url: urlStatic,
                  toNumber:
                    exist.ContactsWAOnAccount.ContactsWA.completeNumber +
                    "@s.whatsapp.net",
                  caption,
                });
                if (!msg?.key?.id) {
                  throw new ErrorResponse(500).toast({
                    title: "Erro ao enviar imagem.",
                    description: "Não foi possível enviar a imagem.",
                    type: "error",
                  });
                }
                const { id: msgId, createAt } = await prisma.messages.create({
                  data: {
                    by: "user",
                    type: "image",
                    caption,
                    message: "",
                    fileName: e.fileName,
                    ticketsId: dto.id,
                    messageKey: msg.key.id,
                  },
                  select: { id: true, createAt: true },
                });
                if (dto.accountId) {
                  cacheAccountSocket
                    .get(dto.accountId)
                    ?.listSocket?.forEach((sockId) => {
                      // isso é só se caso o contato enviar mensagem para o ticket.
                      // socketIo.to(sockId).emit(`inbox`, {
                      //   accountId: dto.accountId,
                      //   departmentId: InboxDepartment.id,
                      //   departmentName: InboxDepartment.name,
                      //   status: "MESSAGE",
                      //   notifyMsc: true,
                      //   notifyToast: true,
                      //   id: dto.id,
                      // });
                      nameSpace.emit("message-list", {
                        content: { id: msgId, type: "image" },
                        by: "contact",
                        departmentId: InboxDepartment.id,
                        notifyMsc: false,
                        notifyToast: false,
                        ticketId: dto.id,
                        userId: dto.userId, // caso seja enviado para um usuário.
                        lastInteractionDate: createAt,
                        read: true,
                      });
                      nameSpace.emit("message", {
                        content: {
                          id: msgId,
                          type: "image",
                          caption,
                          fileName: e.fileName,
                        },
                        by: "user",
                        departmentId: InboxDepartment.id,
                        notifyMsc: false,
                        notifyToast: false,
                        ticketId: dto.id,
                        userId: dto.userId, // caso seja enviado para um usuário.
                        lastInteractionDate: createAt,
                      });
                    });
                }
              }
              if (/^video\//.test(mimetype)) {
                const msg = await SendVideo({
                  connectionId: exist.connectionWAId,
                  toNumber:
                    exist.ContactsWAOnAccount.ContactsWA.completeNumber +
                    "@s.whatsapp.net",
                  caption,
                  video: readFileSync(urlStatic),
                  mimetype: mimetype || undefined,
                });
                if (!msg?.key?.id) {
                  throw new ErrorResponse(500).toast({
                    title: "Erro ao enviar video.",
                    description: "Não foi possível enviar a video.",
                    type: "error",
                  });
                }
                const { id: msgId, createAt } = await prisma.messages.create({
                  data: {
                    by: "user",
                    type: "video",
                    caption,
                    message: "",
                    fileName: e.fileName,
                    ticketsId: dto.id,
                    messageKey: msg.key.id,
                  },
                  select: { id: true, createAt: true },
                });
                if (dto.accountId) {
                  cacheAccountSocket
                    .get(dto.accountId)
                    ?.listSocket?.forEach((sockId) => {
                      // isso é só se caso o contato enviar mensagem para o ticket.
                      // socketIo.to(sockId).emit(`inbox`, {
                      //   accountId: dto.accountId,
                      //   departmentId: InboxDepartment.id,
                      //   departmentName: InboxDepartment.name,
                      //   status: "MESSAGE",
                      //   notifyMsc: true,
                      //   notifyToast: true,
                      //   id: dto.id,
                      // });
                      nameSpace.emit("message-list", {
                        content: { id: msgId, type: "video" },
                        by: "contact",
                        departmentId: InboxDepartment.id,
                        notifyMsc: false,
                        notifyToast: false,
                        ticketId: dto.id,
                        userId: dto.userId, // caso seja enviado para um usuário.
                        lastInteractionDate: createAt,
                        read: true,
                      });
                      nameSpace.emit("message", {
                        content: {
                          id: msgId,
                          type: "video",
                          caption,
                          fileName: e.fileName,
                        },
                        by: "user",
                        departmentId: InboxDepartment.id,
                        notifyMsc: false,
                        notifyToast: false,
                        ticketId: dto.id,
                        userId: dto.userId, // caso seja enviado para um usuário.
                        lastInteractionDate: createAt,
                      });
                    });
                }
              }
            } catch (error) {
              throw new ErrorResponse(500).toast({
                title: "Erro ao enviar imagem.",
                description: "Não foi possível enviar a imagem.",
                type: "error",
              });
            }
          }
          if (dto.type === "audio") {
            const msg = await SendAudio({
              connectionId: exist.connectionWAId,
              toNumber:
                exist.ContactsWAOnAccount.ContactsWA.completeNumber +
                "@s.whatsapp.net",
              urlStatic: urlStatic,
              ptt: file.type === "audio",
              mimetype: mimetype || undefined,
            });
            if (!msg?.key?.id) {
              throw new ErrorResponse(500).toast({
                title: "Erro ao enviar imagem.",
                description: "Não foi possível enviar a audio.",
                type: "error",
              });
            }
            const { id: msgId, createAt } = await prisma.messages.create({
              data: {
                by: "user",
                type: "audio",
                ptt: file.type === "audio",
                message: "",
                fileName: e.fileName,
                ticketsId: dto.id,
                messageKey: msg.key.id,
              },
              select: { id: true, createAt: true },
            });
            if (dto.accountId) {
              cacheAccountSocket
                .get(dto.accountId)
                ?.listSocket?.forEach((sockId) => {
                  // isso é só se caso o contato enviar mensagem para o ticket.
                  // socketIo.to(sockId).emit(`inbox`, {
                  //   accountId: dto.accountId,
                  //   departmentId: InboxDepartment.id,
                  //   departmentName: InboxDepartment.name,
                  //   status: "MESSAGE",
                  //   notifyMsc: true,
                  //   notifyToast: true,
                  //   id: dto.id,
                  // });
                  nameSpace.emit("message-list", {
                    content: { id: msgId, type: "audio" },
                    by: "contact",
                    departmentId: InboxDepartment.id,
                    notifyMsc: false,
                    notifyToast: false,
                    ticketId: dto.id,
                    userId: dto.userId, // caso seja enviado para um usuário.
                    lastInteractionDate: createAt,
                    read: true,
                  });
                  nameSpace.emit("message", {
                    content: {
                      id: msgId,
                      type: "audio",
                      caption,
                      fileName: e.fileName,
                      ptt: file.type === "audio",
                    },
                    by: "user",
                    departmentId: InboxDepartment.id,
                    notifyMsc: false,
                    notifyToast: false,
                    ticketId: dto.id,
                    userId: dto.userId, // caso seja enviado para um usuário.
                    lastInteractionDate: createAt,
                  });
                });
            }
          }
        }
      }
    }

    return { message: "OK!", status: 201 };
  }
}

import { resolve } from "path";
import { SendMessageText } from "../../adapters/Baileys/modules/sendMessage";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { SendTicketMessageDTO_I } from "./DTO";
import { lookup } from "mime-types";
import { resolveTextVariables } from "../../libs/FlowBuilder/utils/ResolveTextVariables";
import { SendFile } from "../../adapters/Baileys/modules/sendFile";
import { readFileSync } from "fs-extra";
import { SendImage } from "../../adapters/Baileys/modules/sendImage";
import { SendVideo } from "../../adapters/Baileys/modules/sendVideo";
import { SendAudio } from "../../adapters/Baileys/modules/sendAudio";
import { webSocketEmitToRoom } from "../../infra/websocket";

// toda resposta de error deve ser feita via socket.
// a mensagem de error deve aparecer no balão da mensagem em cor vermelho e icone de error vermelho.

let path = "";
if (process.env.NODE_ENV === "production") {
  path = resolve(__dirname, "../static/storage");
} else {
  path = resolve(__dirname, "../../../static/storage");
}

export class SendTicketMessageUseCase {
  constructor() {}

  async run({ sockId_ignore, ...dto }: SendTicketMessageDTO_I) {
    const exist = await prisma.tickets.findFirst({
      where: {
        id: dto.id,
        ...(dto.accountId && { accountId: dto.accountId }),
        status: "OPEN",
      },
      select: {
        accountId: true,
        connectionWAId: true,
        InboxDepartment: { select: { id: true } },
        ContactsWAOnAccount: {
          select: {
            id: true,
            ContactsWA: { select: { completeNumber: true } },
          },
        },
      },
    });

    if (!exist) {
      throw new ErrorResponse(400).container(
        "Não foi possivel encontrar o ticket. Error:#61",
      );
    }

    const { InboxDepartment, ContactsWAOnAccount } = exist;

    if (dto.type === "text") {
      try {
        let messageId = 0;
        let msgkey: string | null = null;

        if (exist.connectionWAId) {
          const msg = await SendMessageText({
            connectionId: exist.connectionWAId,
            toNumber: ContactsWAOnAccount.ContactsWA.completeNumber,
            text: dto.text,
            mode: "prod",
          });
          if (!msg?.key?.id) {
            return {
              status: 201,
              msg: [
                {
                  code_uuid: dto.code_uuid,
                  error: "`msgKey` não retornado. Error:#73",
                },
              ],
            };
          }
          msgkey = msg?.key?.id;
        }

        if (!msgkey) {
          return {
            status: 201,
            msg: [
              {
                code_uuid: dto.code_uuid,
                error: "`msgKey` não retornado. Error:#87",
              },
            ],
          };
        }

        const nextText = await resolveTextVariables({
          accountId: exist.accountId,
          contactsWAOnAccountId: exist.ContactsWAOnAccount.id,
          text: dto.text,
          numberLead: exist.ContactsWAOnAccount.ContactsWA.completeNumber,
        });

        const { id: msgId, createAt } = await prisma.messages.create({
          data: {
            by: "user",
            type: "text",
            message: nextText,
            ticketsId: dto.id,
            messageKey: msgkey,
          },
          select: { id: true, createAt: true },
        });
        messageId = msgId;

        if (dto.accountId) {
          const { ticket_chat, player_department } =
            webSocketEmitToRoom().account(dto.accountId!);

          ticket_chat(dto.id).message(
            {
              content: {
                id: messageId,
                text: nextText,
                type: "text",
                createAt,
              },
              ticketId: dto.id,
              by: "user",
            },
            [sockId_ignore],
          );

          player_department(InboxDepartment.id).message_ticket_list(
            {
              text: nextText,
              createAt,
              status: "SENT",
              type: "text",
              by: "user",
              ticketId: dto.id,
            },
            [sockId_ignore],
          );
        }
        return {
          status: 201,
          msg: [{ id: msgId, createAt, code_uuid: dto.code_uuid }],
        };
      } catch (error) {
        return {
          status: 201,
          msg: [
            {
              code_uuid: dto.code_uuid,
              error: "`msgKey` não retornado. Error:#152",
            },
          ],
        };
      }
    } else {
      const files = dto.files || [];
      if (!files.length) {
        throw new ErrorResponse(400).container(
          "É necessário enviar pelo menos um arquivo. Error:#161",
        );
      }

      const msgResponse: any[] = [];
      for (let index = 0; index < files.length; index++) {
        if (!index) {
          const firstFile = files[index];
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
                numberLead: exist.ContactsWAOnAccount.ContactsWA.completeNumber,
              });
            }
            if (dto.type === "file") {
              try {
                let messageId = 0;
                let msgkey: string | null = null;
                if (exist.connectionWAId) {
                  const msg = await SendFile({
                    connectionId: exist.connectionWAId,
                    originalName: e.originalName,
                    toNumber:
                      exist.ContactsWAOnAccount.ContactsWA.completeNumber,
                    caption,
                    document: readFileSync(urlStatic),
                    mimetype: mimetype || undefined,
                  });
                  if (!msg?.key?.id) {
                    msgResponse.push({
                      error: "`msgKey` não retornado. Error:#203",
                      code_uuid: firstFile.code_uuid,
                    });
                    continue;
                  }
                  msgkey = msg?.key?.id;
                }
                if (!msgkey) {
                  msgResponse.push({
                    error: "`msgKey` não retornado. Error:#212",
                    code_uuid: firstFile.code_uuid,
                  });
                  continue;
                }
                const { id: msgId, createAt } = await prisma.messages.create({
                  data: {
                    by: "user",
                    type: "file",
                    caption,
                    message: "",
                    fileName: e.fileName,
                    ticketsId: dto.id,
                    messageKey: msgkey,
                  },
                  select: { id: true, createAt: true },
                });
                messageId = msgId;

                if (dto.accountId) {
                  const { ticket_chat, player_department } =
                    webSocketEmitToRoom().account(dto.accountId!);

                  ticket_chat(dto.id).message(
                    {
                      content: {
                        id: messageId,
                        createAt,
                        type: "file",
                        fileName: e.fileName,
                        caption,
                      },
                      ticketId: dto.id,
                      by: "user",
                    },
                    [sockId_ignore],
                  );

                  player_department(InboxDepartment.id).message_ticket_list(
                    {
                      type: "file",
                      status: "SENT",
                      by: "user",
                      ticketId: dto.id,
                      createAt,
                    },
                    [sockId_ignore],
                  );
                }
                msgResponse.push({
                  id: messageId,
                  createAt,
                  code_uuid: firstFile.code_uuid,
                });
              } catch (error) {
                msgResponse.push({
                  error: "Não foi possivel enviar a mensagem. Error:#268",
                  code_uuid: firstFile.code_uuid,
                });
                continue;
              }
            }
            if (dto.type === "image") {
              try {
                if (!mimetype) {
                  msgResponse.push({
                    error: "Arquivo inválido. Error:#278",
                    code_uuid: firstFile.code_uuid,
                  });
                  continue;
                }
                if (/^image\//.test(mimetype)) {
                  let messageId = 0;
                  let msgkey: string | null = null;
                  if (exist.connectionWAId) {
                    const msg = await SendImage({
                      connectionId: exist.connectionWAId,
                      url: urlStatic,
                      toNumber:
                        exist.ContactsWAOnAccount.ContactsWA.completeNumber,
                      caption,
                    });
                    if (!msg?.key?.id) {
                      msgResponse.push({
                        error: "`msgKey` não retornado. Error:#296",
                        code_uuid: firstFile.code_uuid,
                      });
                      continue;
                    }
                    msgkey = msg?.key?.id;
                  }
                  if (!msgkey) {
                    msgResponse.push({
                      error: "`msgKey` não retornado. Error:#305",
                      code_uuid: firstFile.code_uuid,
                    });
                    continue;
                  }
                  const { id: msgId, createAt } = await prisma.messages.create({
                    data: {
                      by: "user",
                      type: "image",
                      caption,
                      message: "",
                      fileName: e.fileName,
                      ticketsId: dto.id,
                      messageKey: msgkey,
                    },
                    select: { id: true, createAt: true },
                  });
                  messageId = msgId;

                  if (dto.accountId) {
                    const { ticket_chat, player_department } =
                      webSocketEmitToRoom().account(dto.accountId!);

                    ticket_chat(dto.id).message(
                      {
                        content: {
                          id: messageId,
                          createAt,
                          type: "image",
                          fileName: e.fileName,
                          caption,
                        },
                        ticketId: dto.id,
                        by: "user",
                      },
                      [sockId_ignore],
                    );

                    player_department(InboxDepartment.id).message_ticket_list(
                      {
                        type: "image",
                        status: "SENT",
                        by: "user",
                        ticketId: dto.id,
                        createAt,
                      },
                      [sockId_ignore],
                    );
                  }
                  msgResponse.push({
                    id: messageId,
                    createAt,
                    code_uuid: firstFile.code_uuid,
                  });
                }
                if (/^video\//.test(mimetype)) {
                  let messageId = 0;
                  let msgkey: string | null = null;
                  if (exist.connectionWAId) {
                    const msg = await SendVideo({
                      connectionId: exist.connectionWAId,
                      toNumber:
                        exist.ContactsWAOnAccount.ContactsWA.completeNumber,
                      caption,
                      video: readFileSync(urlStatic),
                      mimetype: mimetype || undefined,
                    });
                    if (!msg?.key?.id) {
                      msgResponse.push({
                        error: "`msgKey` não retornado. Error:#374",
                        code_uuid: firstFile.code_uuid,
                      });
                      continue;
                    }
                    msgkey = msg?.key?.id;
                  }
                  if (!msgkey) {
                    msgResponse.push({
                      error: "`msgKey` não retornado. Error:#383",
                      code_uuid: firstFile.code_uuid,
                    });
                    continue;
                  }
                  const { id: msgId, createAt } = await prisma.messages.create({
                    data: {
                      by: "user",
                      type: "video",
                      caption,
                      message: "",
                      fileName: e.fileName,
                      ticketsId: dto.id,
                      messageKey: msgkey,
                    },
                    select: { id: true, createAt: true },
                  });
                  messageId = msgId;
                  if (dto.accountId) {
                    const { ticket_chat, player_department } =
                      webSocketEmitToRoom().account(dto.accountId!);

                    ticket_chat(dto.id).message(
                      {
                        content: {
                          id: messageId,
                          createAt,
                          type: "video",
                          fileName: e.fileName,
                          caption,
                        },
                        ticketId: dto.id,
                        by: "user",
                      },
                      [sockId_ignore],
                    );

                    player_department(InboxDepartment.id).message_ticket_list(
                      {
                        type: "video",
                        status: "SENT",
                        by: "user",
                        ticketId: dto.id,
                        createAt,
                      },
                      [sockId_ignore],
                    );
                  }
                  msgResponse.push({
                    id: messageId,
                    createAt,
                    code_uuid: firstFile.code_uuid,
                  });
                }
              } catch (error) {
                msgResponse.push({
                  error: "Não foi possivel enviar a mensagem. Error:#439",
                  code_uuid: firstFile.code_uuid,
                });
                continue;
              }
            }
            if (dto.type === "audio") {
              try {
                let messageId = 0;
                let msgkey: string | null = null;
                if (exist.connectionWAId) {
                  const msg = await SendAudio({
                    connectionId: exist.connectionWAId,
                    toNumber:
                      exist.ContactsWAOnAccount.ContactsWA.completeNumber,
                    urlStatic: urlStatic,
                    ptt: firstFile.type === "audio",
                    mimetype: mimetype || undefined,
                  });
                  if (!msg?.key?.id) {
                    msgResponse.push({
                      error: "`msgKey` não retornado. Error:#460",
                      code_uuid: firstFile.code_uuid,
                    });
                    continue;
                  }
                  msgkey = msg?.key?.id;
                }
                if (!msgkey) {
                  msgResponse.push({
                    error: "`msgKey` não retornado. Error:#469",
                    code_uuid: firstFile.code_uuid,
                  });
                  continue;
                }
                const { id: msgId, createAt } = await prisma.messages.create({
                  data: {
                    by: "user",
                    type: "audio",
                    ptt: firstFile.type === "audio",
                    message: "",
                    fileName: e.fileName,
                    ticketsId: dto.id,
                    messageKey: msgkey,
                  },
                  select: { id: true, createAt: true },
                });
                messageId = msgId;

                if (dto.accountId) {
                  const { ticket_chat, player_department } =
                    webSocketEmitToRoom().account(dto.accountId!);

                  ticket_chat(dto.id).message(
                    {
                      content: {
                        id: messageId,
                        createAt,
                        type: "audio",
                        fileName: e.fileName,
                        caption,
                        ptt: true,
                      },
                      ticketId: dto.id,
                      by: "user",
                    },
                    [sockId_ignore],
                  );

                  player_department(InboxDepartment.id).message_ticket_list(
                    {
                      type: "audio",
                      status: "SENT",
                      by: "user",
                      ticketId: dto.id,
                      createAt,
                    },
                    [sockId_ignore],
                  );
                }
                msgResponse.push({
                  id: messageId,
                  createAt,
                  code_uuid: firstFile.code_uuid,
                });
              } catch (error) {
                msgResponse.push({
                  error: "Não foi possivel enviar a mensagem. Error:#526",
                  code_uuid: firstFile.code_uuid,
                });
                continue;
              }
            }
          } else {
            msgResponse.push({
              error: "Arquivo não encontrado. Error:#534",
              code_uuid: firstFile.code_uuid,
            });
            continue;
          }
        } else {
          const file = files[index];
          const e = await prisma.storagePaths.findFirst({
            where: { id: file.id, accountId: exist.accountId },
            select: { fileName: true, originalName: true },
          });

          if (e) {
            const urlStatic = `${path}/${e.fileName}`;
            const mimetype = lookup(urlStatic);

            if (dto.type === "file") {
              try {
                let messageId = 0;
                let msgkey: string | null = null;
                if (exist.connectionWAId) {
                  const msg = await SendFile({
                    connectionId: exist.connectionWAId,
                    originalName: e.originalName,
                    toNumber:
                      exist.ContactsWAOnAccount.ContactsWA.completeNumber,
                    document: readFileSync(urlStatic),
                    mimetype: mimetype || undefined,
                  });
                  if (!msg?.key?.id) {
                    msgResponse.push({
                      error: "`msgKey` não retornado. Error:#565",
                      code_uuid: file.code_uuid,
                    });
                    continue;
                  }
                  msgkey = msg?.key?.id;
                }
                if (!msgkey) {
                  msgResponse.push({
                    error: "`msgKey` não retornado. Error:#574",
                    code_uuid: file.code_uuid,
                  });
                  continue;
                }
                const { id: msgId, createAt } = await prisma.messages.create({
                  data: {
                    by: "user",
                    type: "file",
                    message: "",
                    fileName: e.fileName,
                    ticketsId: dto.id,
                    messageKey: msgkey,
                  },
                  select: { id: true, createAt: true },
                });
                messageId = msgId;
                if (dto.accountId) {
                  const { ticket_chat, player_department } =
                    webSocketEmitToRoom().account(dto.accountId!);

                  ticket_chat(dto.id).message(
                    {
                      content: {
                        id: messageId,
                        createAt,
                        type: "file",
                        fileName: e.fileName,
                      },
                      ticketId: dto.id,
                      by: "user",
                    },
                    [sockId_ignore],
                  );

                  player_department(InboxDepartment.id).message_ticket_list(
                    {
                      type: "file",
                      status: "SENT",
                      by: "user",
                      ticketId: dto.id,
                      createAt,
                    },
                    [sockId_ignore],
                  );
                }
                msgResponse.push({
                  id: messageId,
                  createAt,
                  code_uuid: file.code_uuid,
                });
              } catch (error) {
                msgResponse.push({
                  error: "Não foi possivel enviar a mensagem. Error:#627",
                  code_uuid: file.code_uuid,
                });
                continue;
              }
            }
            if (dto.type === "image") {
              try {
                if (!mimetype) {
                  msgResponse.push({
                    error: "Arquivo inválido. Error:#637",
                    code_uuid: file.code_uuid,
                  });
                  continue;
                }
                if (/^image\//.test(mimetype)) {
                  let messageId = 0;
                  let msgkey: string | null = null;
                  if (exist.connectionWAId) {
                    const msg = await SendImage({
                      connectionId: exist.connectionWAId,
                      url: urlStatic,
                      toNumber:
                        exist.ContactsWAOnAccount.ContactsWA.completeNumber,
                    });
                    if (!msg?.key?.id) {
                      msgResponse.push({
                        error: "`msgKey` não retornado. Error:#654",
                        code_uuid: file.code_uuid,
                      });
                      continue;
                    }
                    msgkey = msg?.key?.id;
                  }
                  if (!msgkey) {
                    msgResponse.push({
                      error: "`msgKey` não retornado. Error:#663",
                      code_uuid: file.code_uuid,
                    });
                    continue;
                  }
                  const { id: msgId, createAt } = await prisma.messages.create({
                    data: {
                      by: "user",
                      type: "image",
                      message: "",
                      fileName: e.fileName,
                      ticketsId: dto.id,
                      messageKey: msgkey,
                    },
                    select: { id: true, createAt: true },
                  });
                  messageId = msgId;

                  if (dto.accountId) {
                    const { ticket_chat, player_department } =
                      webSocketEmitToRoom().account(dto.accountId!);

                    ticket_chat(dto.id).message(
                      {
                        content: {
                          id: messageId,
                          createAt,
                          type: "image",
                          fileName: e.fileName,
                        },
                        ticketId: dto.id,
                        by: "user",
                      },
                      [sockId_ignore],
                    );

                    player_department(InboxDepartment.id).message_ticket_list(
                      {
                        type: "image",
                        status: "SENT",
                        by: "user",
                        ticketId: dto.id,
                        createAt,
                      },
                      [sockId_ignore],
                    );
                  }
                  msgResponse.push({
                    id: messageId,
                    createAt,
                    code_uuid: file.code_uuid,
                  });
                }

                if (/^video\//.test(mimetype)) {
                  let messageId = 0;
                  let msgkey: string | null = null;
                  if (exist.connectionWAId) {
                    const msg = await SendVideo({
                      connectionId: exist.connectionWAId,
                      toNumber:
                        exist.ContactsWAOnAccount.ContactsWA.completeNumber,
                      video: readFileSync(urlStatic),
                      mimetype: mimetype || undefined,
                    });
                    if (!msg?.key?.id) {
                      msgResponse.push({
                        error: "`msgKey` não retornado. Error:#730",
                        code_uuid: file.code_uuid,
                      });
                      continue;
                    }
                    msgkey = msg?.key?.id;
                  }
                  if (!msgkey) {
                    msgResponse.push({
                      error: "`msgKey` não retornado. Error:#742",
                      code_uuid: file.code_uuid,
                    });
                    continue;
                  }
                  const { id: msgId, createAt } = await prisma.messages.create({
                    data: {
                      by: "user",
                      type: "video",
                      message: "",
                      fileName: e.fileName,
                      ticketsId: dto.id,
                      messageKey: msgkey,
                    },
                    select: { id: true, createAt: true },
                  });
                  messageId = msgId;
                  if (dto.accountId) {
                    const { ticket_chat, player_department } =
                      webSocketEmitToRoom().account(dto.accountId!);

                    ticket_chat(dto.id).message(
                      {
                        content: {
                          id: messageId,
                          createAt,
                          type: "video",
                          fileName: e.fileName,
                        },
                        ticketId: dto.id,
                        by: "user",
                      },
                      [sockId_ignore],
                    );

                    player_department(InboxDepartment.id).message_ticket_list(
                      {
                        type: "video",
                        status: "SENT",
                        by: "user",
                        ticketId: dto.id,
                        createAt,
                      },
                      [sockId_ignore],
                    );
                  }
                  msgResponse.push({
                    id: messageId,
                    createAt,
                    code_uuid: file.code_uuid,
                  });
                }
              } catch (error) {
                msgResponse.push({
                  error: "Não foi possivel enviar a mensagem. Error:#793",
                  code_uuid: file.code_uuid,
                });
                continue;
              }
            }
            if (dto.type === "audio") {
              try {
                let messageId = 0;
                let msgkey: string | null = null;
                if (exist.connectionWAId) {
                  const msg = await SendAudio({
                    connectionId: exist.connectionWAId,
                    toNumber:
                      exist.ContactsWAOnAccount.ContactsWA.completeNumber,
                    urlStatic: urlStatic,
                    ptt: file.type === "audio",
                    mimetype: mimetype || undefined,
                  });
                  if (!msg?.key?.id) {
                    msgResponse.push({
                      error: "`msgKey` não retornado. Error:#814",
                      code_uuid: file.code_uuid,
                    });
                    continue;
                  }
                  msgkey = msg?.key?.id;
                }
                if (!msgkey) {
                  msgResponse.push({
                    error: "`msgKey` não retornado. Error:#823",
                    code_uuid: file.code_uuid,
                  });
                  continue;
                }
                const { id: msgId, createAt } = await prisma.messages.create({
                  data: {
                    by: "user",
                    type: "audio",
                    ptt: file.type === "audio",
                    message: "",
                    fileName: e.fileName,
                    ticketsId: dto.id,
                    messageKey: msgkey,
                  },
                  select: { id: true, createAt: true },
                });
                messageId = msgId;
                if (dto.accountId) {
                  const { ticket_chat, player_department } =
                    webSocketEmitToRoom().account(dto.accountId!);

                  ticket_chat(dto.id).message(
                    {
                      content: {
                        id: messageId,
                        createAt,
                        type: "audio",
                        fileName: e.fileName,
                        ptt: true,
                      },
                      ticketId: dto.id,
                      by: "user",
                    },
                    [sockId_ignore],
                  );

                  player_department(InboxDepartment.id).message_ticket_list(
                    {
                      type: "audio",
                      status: "SENT",
                      by: "user",
                      ticketId: dto.id,
                      createAt,
                    },
                    [sockId_ignore],
                  );
                }
                msgResponse.push({
                  id: messageId,
                  createAt,
                  code_uuid: file.code_uuid,
                });
              } catch (error) {
                msgResponse.push({
                  error: "Não foi possivel enviar a mensagem. Error:#878",
                  code_uuid: file.code_uuid,
                });
                continue;
              }
            }
          }
        }
      }

      return { status: 201, msg: msgResponse };
    }
  }
}

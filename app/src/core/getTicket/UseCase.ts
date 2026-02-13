import { GetTicketDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";

export class GetTicketUseCase {
  constructor() {}

  async run(dto: GetTicketDTO_I) {
    const data = await prisma.tickets.findFirst({
      where: {
        ...(dto.accountId && { accountId: dto.accountId }),
        ...(dto.userId && {
          OR: [{ inboxUserId: dto.userId }, { inboxUserId: null }],
        }),
        id: dto.id,
      },
      select: {
        id: true,
        ConnectionIg: { select: { ig_username: true, id: true } },
        ConnectionWA: { select: { id: true, name: true } },
        status: true,
        InboxDepartment: {
          select: { id: true, businessId: true },
        },
        ContactsWAOnAccount: {
          select: {
            name: true,
            ContactsWA: { select: { completeNumber: true } },
            TagOnContactsWAOnAccount: {
              select: {
                Tag: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
        inboxUserId: true,
        GoBackFlowState: {
          select: {
            Messages: {
              orderBy: { createAt: "asc" },
              select: {
                type: true,
                address: true,
                by: true,
                caption: true,
                createAt: true,
                fileName: true,
                fullName: true,
                latitude: true,
                inboxUserId: true,
                messageKey: true,
                message: true,
                fileNameOriginal: true,
                longitude: true,
                name: true,
                number: true,
                org: true,
                ptt: true,
                id: true,
              },
            },
          },
        },
        Messages: {
          orderBy: { createAt: "asc" },
          select: {
            type: true,
            address: true,
            by: true,
            caption: true,
            createAt: true,
            fileName: true,
            fullName: true,
            latitude: true,
            inboxUserId: true,
            message: true,
            messageKey: true,
            fileNameOriginal: true,
            longitude: true,
            name: true,
            number: true,
            org: true,
            ptt: true,
            id: true,
          },
        },
      },
    });

    if (!data) {
      throw new ErrorResponse(400).container("Ticket não encontrado.");
    }

    await prisma.messages.updateMany({
      where: { ticketsId: dto.id, read: false },
      data: { read: true },
    });

    const {
      ContactsWAOnAccount,
      Messages,
      GoBackFlowState,
      InboxDepartment,
      ConnectionIg,
      ConnectionWA,
      ...rest
    } = data;

    const listMessages = [...(GoBackFlowState?.Messages || []), ...Messages];

    let connection: any = {};

    if (ConnectionWA?.name) {
      connection = {
        s: !!cacheConnectionsWAOnline.get(ConnectionWA?.id),
        ...ConnectionWA,
        channel: "baileys",
      };
    }

    if (ConnectionIg?.ig_username) {
      connection = {
        s: true,
        name: ConnectionIg.ig_username,
        id: ConnectionIg.id,
        channel: "instagram",
      };
    }

    return {
      message: "OK!",
      status: 200,
      ticket: {
        ...rest,
        connection,
        inboxDepartmentId: InboxDepartment.id,
        businessId: InboxDepartment.businessId,
        messages: listMessages.map((msg) => {
          if (msg.type === "text") {
            return {
              content: {
                createAt: msg.createAt,
                type: "text",
                text: msg.message,
                id: msg.id,
                messageKey: msg.messageKey,
              },
              by: msg.by,
            };
          }
          if (msg.type === "audio") {
            return {
              by: msg.by,
              content: {
                createAt: msg.createAt,
                type: "audio",
                id: msg.id,
                fileName: msg.fileName,
                ptt: msg.ptt,
                messageKey: msg.messageKey,
              },
            };
          }
          if (msg.type === "image") {
            return {
              by: msg.by,
              content: {
                createAt: msg.createAt,
                type: "image",
                caption: msg.caption,
                id: msg.id,
                fileName: msg.fileName,
                messageKey: msg.messageKey,
              },
            };
          }
          if (msg.type === "file") {
            return {
              by: msg.by,
              content: {
                createAt: msg.createAt,
                type: "file",
                id: msg.id,
                fileName: msg.fileName,
                caption: msg.caption,
                fileNameOriginal: msg.fileNameOriginal,
                messageKey: msg.messageKey,
              },
            };
          }
          if (msg.type === "video") {
            return {
              by: msg.by,
              content: {
                createAt: msg.createAt,
                type: "video",
                id: msg.id,
                caption: msg.caption,
                fileName: msg.fileName,
                messageKey: msg.messageKey,
              },
            };
          }

          return {
            by: msg.by,
            content: {
              createAt: msg.createAt,
              type: "file",
              id: msg.id,
              caption: msg.caption,
              fileNameOriginal: msg.fileNameOriginal,
              fileName: msg.fileName,
              messageKey: msg.messageKey,
            },
          };
        }),
        contact: {
          name: ContactsWAOnAccount.name,
          completeNumber: ContactsWAOnAccount.ContactsWA.completeNumber,
          tags: ContactsWAOnAccount.TagOnContactsWAOnAccount.map((tag) => ({
            id: tag.Tag.id,
            name: tag.Tag.name,
          })),
        },
      },
    };
  }
}

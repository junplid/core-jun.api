import { GetTicketsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";

export class GetTicketsUseCase {
  constructor() {}

  async run({ page, ...dto }: GetTicketsDTO_I) {
    // pagination
    const pageSize = 20;
    const skip = page ? (page - 1) * pageSize : 0;

    const data = await prisma.tickets.findMany({
      where: {
        ...(dto.userId && {
          InboxDepartment: { InboxUsers: { some: { id: dto.userId } } },
        }),
        ...(dto.accountId && { accountId: dto.accountId }),
        ...(dto.status && { status: dto.status }),
      },
      // skip,
      // take: pageSize,
      // orderBy: {
      // pela ultima mensagem recebida
      // },
      select: {
        id: true,
        status: true,

        ConnectionWA: { select: { name: true, id: true } },
        ConnectionIg: { select: { ig_username: true } },

        inboxDepartmentId: true,
        ContactsWAOnAccount: { select: { name: true } },
        inboxUserId: true,
        createAt: true,
        _count: {
          select: { Messages: { where: { read: false, by: "contact" } } },
        },
        Messages: {
          take: 1, // pega apenas a última mensagem
          orderBy: { createAt: "desc" },
          select: {
            by: true,
            createAt: true,
            type: true,
            message: true,
            messageKey: true,
          },
        },
      },
    });

    return {
      message: "OK!",
      status: 200,
      tickets: data.map(
        ({
          ContactsWAOnAccount,
          _count,
          Messages,
          ConnectionWA,
          ConnectionIg,
          createAt,
          ...r
        }) => {
          let lastMessage = null;
          if (Messages.length) {
            if (Messages[0].type === "text") {
              lastMessage = Messages[0].message;
            } else {
              lastMessage = "🎤📷 Arquivo de midia.";
            }
          }

          let connection: any = {};

          if (ConnectionWA?.name) {
            connection = {
              s: !!cacheConnectionsWAOnline.get(ConnectionWA?.id),
              name: ConnectionWA.name,
              channel: "baileys",
            };
          }
          if (ConnectionIg?.ig_username) {
            connection = {
              s: true,
              name: ConnectionIg.ig_username,
              channel: "instagram",
            };
          }

          return {
            ...r,
            connection,
            name: ContactsWAOnAccount?.name || "<Desconhecido(a)>",
            count_unread: _count.Messages,
            lastMessage,
            by: Messages[0].by,
            messageKey: Messages.length ? Messages[0].messageKey : undefined,
            lastInteractionDate: Messages.length
              ? Messages[0].createAt
              : createAt,
          };
        },
      ),
    };
  }
}

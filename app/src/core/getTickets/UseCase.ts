import { GetTicketsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

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
        inboxDepartmentId: true,
        ContactsWAOnAccount: { select: { name: true } },
        inboxUserId: true,
        createAt: true,
        _count: {
          select: { TicketMessages: { where: { read: false, by: "contact" } } },
        },
        TicketMessages: {
          take: 1, // pega apenas a última mensagem
          orderBy: { createAt: "desc" },
          select: { createAt: true, type: true, message: true },
        },
      },
    });

    return {
      message: "OK!",
      status: 200,
      tickets: data.map(
        ({ ContactsWAOnAccount, _count, TicketMessages, createAt, ...r }) => {
          let lastMessage = null;
          if (TicketMessages.length) {
            if (TicketMessages[0].type === "text") {
              lastMessage = TicketMessages[0].message;
            } else {
              lastMessage = "🎤📷 Arquivo de midia.";
            }
          }
          return {
            ...r,
            name: ContactsWAOnAccount?.name || "<Desconhecido(a)>",
            count_unread: _count.TicketMessages,
            lastMessage,
            lastInteractionDate: TicketMessages.length
              ? TicketMessages[0].createAt
              : createAt,
          };
        }
      ),
    };
  }
}

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
        TicketMessages: {
          take: 1, // pega apenas a última mensagem
          orderBy: { createAt: "asc" },
          select: { createAt: true },
        },
      },
    });

    return {
      message: "OK!",
      status: 200,
      tickets: data.map(
        ({ ContactsWAOnAccount, TicketMessages, createAt, ...r }) => {
          return {
            ...r,
            name: ContactsWAOnAccount?.name || "<Desconhecido(a)>",
            lastInteractionDate: TicketMessages.length
              ? TicketMessages[0].createAt
              : createAt,
          };
        }
      ),
    };
  }
}

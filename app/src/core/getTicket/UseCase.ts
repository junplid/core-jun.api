import { GetTicketDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetTicketUseCase {
  constructor() {}

  async run(dto: GetTicketDTO_I) {
    const data = await prisma.tickets.findFirst({
      where: {
        ...(dto.accountId && { accountId: dto.accountId }),
        ...(dto.userId && {
          OR: [{ inboxUserId: dto.userId }, { inboxUserId: null }],
        }),
      },
      select: {
        id: true,
        status: true,
        inboxDepartmentId: true,
        ContactsWAOnAccount: {
          select: {
            name: true,
            ContactsWA: { select: { completeNumber: true } },
          },
        },
        inboxUserId: true,
        TicketMessages: {
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
            longitude: true,
            name: true,
            number: true,
            org: true,
            id: true,
          },
        },
      },
    });

    if (!data) {
      throw new ErrorResponse(400).container("Ticket não encontrado.");
    }

    const { ContactsWAOnAccount, TicketMessages, ...rest } = data;

    return {
      message: "OK!",
      status: 200,
      ticket: {
        ...rest,
        messages: TicketMessages.map((msg) => {
          if (msg.type === "text") {
            return {
              content: {
                createAt: msg.createAt,
                type: "text",
                text: msg.message,
                id: msg.id,
              },
              by: msg.by,
            };
          }
          // limpar os dados null que vai vim
          return { ...msg };
        }),
        contact: {
          name: ContactsWAOnAccount.name,
          completeNumber: ContactsWAOnAccount.ContactsWA.completeNumber,
        },
      },
    };
  }
}

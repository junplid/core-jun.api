import { Prisma, PrismaClient, TypeSentBy } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetTicketMessagesRepository_I } from "./Repository";

export class GetTicketMessagesImplementation
  implements GetTicketMessagesRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetchAttendantOfTicket(
    userId: number,
    ticketId: number
  ): Promise<number> {
    try {
      return await this.prisma.tickets.count({
        where: { id: ticketId },
      });
    } catch (error) {
      throw new Error("Erro `Create Connection`.");
    }
  }

  async fetchMessagesOfTicket(
    userId: number,
    ticketId: number,
    isRead?: boolean
  ): Promise<{
    leadName: string;
    businessId: number;
    conversation: {
      id: number;
      createAt: Date;
      type: string;
      sentBy: TypeSentBy;
      read: boolean;
      message: string;
      fullName: string;
      number: string;
      org?: string;
    }[];
  } | null> {
    try {
      const data = await this.prisma.tickets.findFirst({
        where: { id: ticketId },
        select: {
          businessId: true,
          ContactsWAOnAccount: { select: { name: true } },
          ConversationTickes: {
            orderBy: { createAt: "asc" },
            select: {
              id: true,
              caption: true,
              fileName: true,
              fullName: true,
              number: true,
              org: true,
              address: true,
              degreesLatitude: true,
              degreesLongitude: true,
              name: true,
              message: true,
              read: true,
              sentBy: true,
              type: true,
              createAt: true,
            },
          },
        },
      });
      if (data?.ConversationTickes.length && isRead) {
        await this.prisma.conversationTickes.updateMany({
          where: { ticketsId: ticketId, read: false },
          data: { read: true },
        });
      }
      return data
        ? {
            businessId: data.businessId,
            conversation: data.ConversationTickes,
            leadName: data.ContactsWAOnAccount.name,
          }
        : null;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Connection`.");
    }
  }
}

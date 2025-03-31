import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { DeleteReportLeadHumanServiceRepository_I } from "./Repository";

export class DeleteReportLeadHumanServiceImplementation
  implements DeleteReportLeadHumanServiceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async delete({
    userId,
    ticketId,
    id,
  }: {
    userId: number;
    ticketId: number;
    id: number;
  }): Promise<boolean> {
    try {
      const contact = await this.prisma.tickets.findUnique({
        where: { id: ticketId },
        select: { contactsWAOnAccountId: true },
      });
      if (!contact) return false;
      await this.prisma.humanServiceReportLead.delete({
        where: {
          id,
          HumanServiceOnBusinessOnContactsWAOnAccount: {
            Business: { SectorsAttendants: { some: { id: userId } } },
            contactsWAOnAccountId: contact.contactsWAOnAccountId,
          },
        },
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

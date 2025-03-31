import {
  Prisma,
  PrismaClient,
  TypeHumanServiceReportLead,
} from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetReportLeadHumanServiceRepository_I, Props } from "./Repository";

export class GetReportLeadHumanServiceImplementation
  implements GetReportLeadHumanServiceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch({ userId, type, ticketId }: Props): Promise<
    | {
        id: number;
        value: string;
        createAt: Date;
        humanServiceOnBusinessOnContactsWAOnAccountId: number;
        type: TypeHumanServiceReportLead;
      }[]
    | null
  > {
    try {
      const contact = await this.prisma.tickets.findUnique({
        where: { id: ticketId },
        select: { contactsWAOnAccountId: true },
      });
      if (!contact) return null;
      return await this.prisma.humanServiceReportLead.findMany({
        where: {
          ...(type?.length && { type: { in: type } }),
          HumanServiceOnBusinessOnContactsWAOnAccount: {
            Business: { SectorsAttendants: { some: { id: userId } } },
            contactsWAOnAccountId: contact.contactsWAOnAccountId,
          },
        },
        orderBy: { createAt: "desc" },
        select: {
          humanServiceOnBusinessOnContactsWAOnAccountId: true,
          id: true,
          value: true,
          type: true,
          createAt: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get checkpoint fetchAlreadyExists`.");
    }
  }
}

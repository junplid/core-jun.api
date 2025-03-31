import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { CreateReportLeadHumanServiceRepository_I, Props } from "./Repository";

export class CreateReportLeadHumanServiceImplementation
  implements CreateReportLeadHumanServiceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async create(props: Props): Promise<{
    id: number;
    createAt: Date;
  } | null> {
    try {
      const contact = await this.prisma.tickets.findUnique({
        where: { id: props.ticketId },
        select: { contactsWAOnAccountId: true },
      });
      if (!contact) return null;
      return await this.prisma.humanServiceReportLead.create({
        data: {
          HumanServiceOnBusinessOnContactsWAOnAccount: {
            connect: {
              contactsWAOnAccountId: contact.contactsWAOnAccountId,
              Business: { SectorsAttendants: { some: { id: props.userId } } },
            },
          },
          type: props.type,
          value: props.value,
        },
        select: { id: true, createAt: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Connection`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetDocumentContactAccountFileRepository_I } from "./Repository";

export class GetDocumentContactAccountFileImplementation
  implements GetDocumentContactAccountFileRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(
    contactAccountId: number
  ): Promise<{ id: number; name: string; type: string }[]> {
    try {
      return await this.prisma.documentsOnContact.findMany({
        where: { contactAccountId },
        select: { id: true, name: true, type: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Business`.");
    }
  }

  async fetchContactAccount(ticketId: number): Promise<number | undefined> {
    try {
      const data = await this.prisma.tickets.findUnique({
        where: { id: ticketId },
        select: { contactsWAOnAccountId: true },
      });
      return data?.contactsWAOnAccountId;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Business`.");
    }
  }
}

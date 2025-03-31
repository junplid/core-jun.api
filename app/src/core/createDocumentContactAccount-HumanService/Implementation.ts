import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  CreateDocumentContactAccountFileRepository_I,
  PropsCreate,
} from "./Repository";

export class CreateDocumentContactAccountFileImplementation
  implements CreateDocumentContactAccountFileRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async create(data: PropsCreate): Promise<{
    readonly id: number;
  }> {
    try {
      return await this.prisma.documentsOnContact.create({
        data,
        select: { id: true },
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

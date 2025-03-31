import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { CreateTagContactHumanServiceRepository_I } from "./Repository";

export class CreateTagContactHumanServiceImplementation
  implements CreateTagContactHumanServiceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetchAttendantExist(props: {
    userId: number;
  }): Promise<{ businessId: number; accountId: number } | null> {
    try {
      return await this.prisma.sectorsAttendants.findUnique({
        where: { id: props.userId, status: true },
        select: { businessId: true, accountId: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }

  async fetchTagOnBusinessId(props: {
    id: number;
    businessId: number;
  }): Promise<
    | {
        tagBusinessId: number;
        tagName: string;
      }
    | undefined
  > {
    try {
      const d = await this.prisma.tagOnBusiness.findFirst({
        where: { tagId: props.id, businessId: props.businessId },
        select: { id: true, Tag: { select: { name: true } } },
      });
      return d ? { tagBusinessId: d.id, tagName: d.Tag.name } : undefined;
    } catch (error) {
      throw new Error("Erro `Fetch Plans`.");
    }
  }

  async fetchContactAccount(ticketId: number): Promise<number | undefined> {
    try {
      const dd = await this.prisma.tickets.findFirst({
        where: { id: ticketId },
        select: { contactsWAOnAccountId: true },
      });
      return dd?.contactsWAOnAccountId;
    } catch (error) {
      throw new Error("Erro `Fetch Plans`.");
    }
  }

  async addTagOnContactAccount(props: {
    contactAccountId: number;
    tagBusinessId: number;
  }): Promise<void> {
    try {
      await this.prisma.tagOnBusinessOnContactsWAOnAccount.create({
        data: {
          contactsWAOnAccountId: props.contactAccountId,
          tagOnBusinessId: props.tagBusinessId,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  async existTagOnContactAccount(props: {
    contactAccountId: number;
    tagBusinessId: number;
  }): Promise<boolean> {
    try {
      return !!(await this.prisma.tagOnBusinessOnContactsWAOnAccount.findFirst({
        where: {
          contactsWAOnAccountId: props.contactAccountId,
          tagOnBusinessId: props.tagBusinessId,
        },
        select: { id: true },
      }));
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }
}

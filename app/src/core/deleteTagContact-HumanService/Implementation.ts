import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { DeleteTagContactHumanServiceRepository_I } from "./Repository";

export class DeleteTagContactHumanServiceImplementation
  implements DeleteTagContactHumanServiceRepository_I
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

  async fetchExist(id: number): Promise<boolean> {
    try {
      return !!(await this.prisma.tag.findFirst({
        where: { id },
        select: { name: true },
      }));
    } catch (error) {
      throw new Error("Erro `Fetch Plans`.");
    }
  }

  async fetchContactTagBusinessId(props: {
    ticketId: number;
    tagId: number;
  }): Promise<number | undefined> {
    try {
      const dd = await this.prisma.tagOnBusinessOnContactsWAOnAccount.findFirst(
        {
          where: {
            ContactsWAOnAccount: { Tickets: { some: { id: props.ticketId } } },
            TagOnBusiness: { tagId: props.tagId },
          },
          select: { id: true },
        }
      );

      return dd?.id;
    } catch (error) {
      throw new Error("Erro `Fetch Plans`.");
    }
  }

  async delete(props: { contactsTagBusinessId: number }): Promise<void> {
    try {
      await this.prisma.tagOnBusinessOnContactsWAOnAccount.delete({
        where: { id: props.contactsTagBusinessId },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { DeleteVariableContactHumanServiceRepository_I } from "./Repository";

export class DeleteVariableContactHumanServiceImplementation
  implements DeleteVariableContactHumanServiceRepository_I
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

  async fetchExist(id: number): Promise<string | undefined> {
    try {
      const dd = await this.prisma.variable.findFirst({
        where: { id },
        select: { name: true, VariableOnBusiness: true },
      });

      return dd?.name;
    } catch (error) {
      throw new Error("Erro `Fetch Plans`.");
    }
  }

  async fetchContactVariableBusinessId(props: {
    ticketId: number;
    variableId: number;
  }): Promise<number | undefined> {
    try {
      const dd =
        await this.prisma.contactsWAOnAccountVariableOnBusiness.findFirst({
          where: {
            ContactsWAOnAccount: {
              Tickets: { some: { id: props.ticketId } },
            },
            VariableOnBusiness: { variableId: props.variableId },
          },
          select: { id: true },
        });

      return dd?.id;
    } catch (error) {
      throw new Error("Erro `Fetch Plans`.");
    }
  }

  async delete(props: { contactsVariableBusinessId: number }): Promise<void> {
    try {
      await this.prisma.contactsWAOnAccountVariableOnBusiness.delete({
        where: { id: props.contactsVariableBusinessId },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }
}

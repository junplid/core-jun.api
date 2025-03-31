import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { UpdateVariableContactHumanServiceRepository_I } from "./Repository";

export class UpdateVariableContactHumanServiceImplementation
  implements UpdateVariableContactHumanServiceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async updateContactAccountVariableBusiness(props: {
    id: number;
    contactAccountId: number;
    value: string;
    businessId: number;
  }): Promise<void> {
    try {
      const contactVariable =
        await this.prisma.contactsWAOnAccountVariableOnBusiness.findFirst({
          where: {
            contactsWAOnAccountId: props.contactAccountId,
            VariableOnBusiness: { variableId: props.id },
          },
          select: { id: true },
        });

      if (!contactVariable) {
        const variableOnBusinessId =
          await this.prisma.variableOnBusiness.findFirst({
            where: { variableId: props.id, businessId: props.businessId },
            select: { id: true },
          });
        if (!variableOnBusinessId) {
          throw { message: "Variável não está anexada ao negócio" };
        }
        await this.prisma.contactsWAOnAccountVariableOnBusiness.create({
          data: {
            contactsWAOnAccountId: props.contactAccountId,
            variableOnBusinessId: variableOnBusinessId.id,
            value: props.value,
          },
        });
        return;
      }

      await this.prisma.contactsWAOnAccountVariableOnBusiness.update({
        where: { id: contactVariable.id },
        data: { value: props.value },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
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
}

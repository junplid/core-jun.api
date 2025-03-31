import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { CreateVariableHumanServiceRepository_I } from "./Repository";

export class CreateVariableHumanServiceImplementation
  implements CreateVariableHumanServiceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async create(props: {
    name: string;
    userId: number;

    businessId: number;
    accountId: number;
  }): Promise<{ id: number }> {
    try {
      return await this.prisma.variable.create({
        data: {
          accountId: props.accountId,
          name: props.name,
          VariableOnBusiness: { create: { businessId: props.businessId } },
        },
        select: { id: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  async fetchExist({
    businessId,
    ...props
  }: {
    name: string;
    businessId: number;
  }): Promise<number | undefined> {
    try {
      const dd = await this.prisma.variable.findFirst({
        where: {
          ...props,
          VariableOnBusiness: { some: { businessId: businessId } },
        },
        select: { id: true },
      });
      return dd?.id;
    } catch (error) {
      console.log(error);
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

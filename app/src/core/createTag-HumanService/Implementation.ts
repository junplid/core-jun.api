import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { CreateTagHumanServiceRepository_I } from "./Repository";

export class CreateTagHumanServiceImplementation
  implements CreateTagHumanServiceRepository_I
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

  async create(props: {
    name: string;
    businessId: number;
    accountId: number;
  }): Promise<{ id: number }> {
    try {
      return await this.prisma.tag.create({
        data: {
          accountId: props.accountId,
          type: "contactwa",
          name: props.name,
          TagOnBusiness: { create: { businessId: props.businessId } },
        },
        select: { id: true },
      });
    } catch (error) {
      throw new Error("Erro `Fetch Plans`.");
    }
  }

  async fetchExists(props: {
    name: string;
    businessId: number;
    accountId: number;
  }): Promise<boolean> {
    try {
      return !!(await this.prisma.tag.findFirst({
        where: {
          accountId: props.accountId,
          type: "contactwa",
          name: props.name,
          TagOnBusiness: { some: { businessId: props.businessId } },
        },
        select: { id: true },
      }));
    } catch (error) {
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

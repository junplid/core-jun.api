import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { CreateIntegrationRepository_I } from "./Repository";

export class CraeteSectorImplementation
  implements CreateIntegrationRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetchExist(props: {
    accountId: number;
    key: string;
    token: string;
    type: "trello";
    name: string;
  }): Promise<number> {
    try {
      return await this.prisma.integrations.count({ where: props });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Sector`.");
    }
  }

  async create(props: {
    accountId: number;
    key: string;
    token: string;
    type: "trello";
    name: string;
  }): Promise<{ id: number; createAt: Date }> {
    try {
      const { id, createAt } = await this.prisma.integrations.create({
        data: props,
        select: { id: true, createAt: true },
      });
      return { id, createAt };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Sector`.");
    }
  }
}

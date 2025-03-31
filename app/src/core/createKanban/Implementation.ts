import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  CreateKanbanRepository_I,
  CreateReturn,
  PropsCreate,
} from "./Repository";

export class CraeteKanbanImplementation implements CreateKanbanRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async create({ columns, ...data }: PropsCreate): Promise<CreateReturn> {
    try {
      const { Business, ...funnel } = await this.prisma.funnelKanban.create({
        data: {
          ...data,
          StepsFunnelKanban: {
            createMany: {
              data: columns.map((item) => ({
                ...item,
                accountId: data.accountId,
              })),
            },
          },
        },
        select: {
          id: true,
          createAt: true,
          Business: { select: { name: true } },
        },
      });
      return {
        ...funnel,
        business: Business.name,
      };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Kanban`.");
    }
  }

  async fetchExist(props: {
    name: string;
    accountId: number;
    businessId: number;
  }): Promise<number> {
    try {
      return await this.prisma.funnelKanban.count({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Kanban`.");
    }
  }
}

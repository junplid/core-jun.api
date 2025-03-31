import { Prisma, PrismaClient } from "@prisma/client";
import { GetPlansRootRepository_I, Plan_I } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetPlansRootImplementation implements GetPlansRootRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(): Promise<Plan_I[]> {
    try {
      return await this.prisma.plan.findMany({
        include: {
          PlanAssets: true,
          PlanPeriods: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Connection`.");
    }
  }
}

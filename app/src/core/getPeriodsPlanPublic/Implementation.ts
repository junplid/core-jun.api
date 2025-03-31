import { PlanPeriods, Prisma, PrismaClient } from "@prisma/client";
import { GetPeriodsPlanPublicRepository_I } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetPeriodsPlanPublicImplementation
  implements GetPeriodsPlanPublicRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch({ planId }: { planId: number }): Promise<PlanPeriods[]> {
    try {
      return await this.prisma.planPeriods.findMany({
        where: { planId },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Connection`.");
    }
  }
}

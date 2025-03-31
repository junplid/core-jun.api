import {
  PlanAssets,
  Prisma,
  PrismaClient,
  TypeExtraPackages,
} from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  AsaasWebHookChargesRepository_I,
  PropsFetchPlan_I,
} from "./Repository";

export class AsaasWebHookChargesImplementation
  implements AsaasWebHookChargesRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async updatePlanAccount(props: {
    accountId: number;
    planId: number;
  }): Promise<void> {
    try {
      await this.prisma.account.update({
        where: { id: props.accountId },
        data: { planId: props.planId },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }

  async getExtraP(props: {
    id: number;
  }): Promise<{ type: TypeExtraPackages; amount: number } | null> {
    try {
      return await this.prisma.extraPackages.findUnique({
        where: props,
        select: {
          amount: true,
          type: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

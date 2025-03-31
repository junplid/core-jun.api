import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { CreateExtraPackageDTO_I } from "./DTO";
import { CreateExtraPackageRepository_I } from "./Repository";

export class CraeteCompanyImplementation
  implements CreateExtraPackageRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetchExist({ name }: { name: string }): Promise<number> {
    try {
      return await this.prisma.extraPackages.count({
        where: { status: true, name },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }

  async create({
    planIds,
    ...data
  }: Omit<CreateExtraPackageDTO_I, "rootId">): Promise<{
    readonly id: number;
    readonly createAt: Date;
    plans: { id: number; name: string }[];
  }> {
    try {
      const datas = await this.prisma.extraPackages.create({
        data: {
          ...data,
          ...(planIds?.length
            ? {
                ExtraPackageOnPlans: {
                  createMany: { data: planIds.map((planId) => ({ planId })) },
                },
              }
            : { allPlans: true }),
        },
        select: {
          id: true,
          createAt: true,
          ExtraPackageOnPlans: {
            select: { Plan: { select: { name: true, id: true } } },
          },
        },
      });
      return {
        createAt: datas.createAt,
        id: datas.id,
        plans: datas.ExtraPackageOnPlans.map((s) => s.Plan),
      };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account`.");
    }
  }
}

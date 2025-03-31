import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetExtraPackagesRootRepository_I, Result } from "./Repository";

export class GetExtraPackagesRootImplementation
  implements GetExtraPackagesRootRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(): Promise<Result[]> {
    try {
      const data = await this.prisma.extraPackages.findMany({
        select: {
          id: true,
          status: true,
          name: true,
          type: true,
          newSubscribers: true,
          periodValidityEnd: true,
          periodValidityStart: true,
          amount: true,
          cycle: true,
          price: true,
          createAt: true,
          ExtraPackageOnPlans: {
            select: { Plan: { select: { name: true, id: true } } },
          },
        },
      });

      return data.map(({ ExtraPackageOnPlans, ...extra }) => ({
        ...extra,
        plans: ExtraPackageOnPlans.map((s) => s.Plan),
      }));
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get checkpoint fetchAlreadyExists`.");
    }
  }
}

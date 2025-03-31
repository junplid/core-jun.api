import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetExtraPackagesRepository_I, Result } from "./Repository";

export class GetExtraPackagesImplementation
  implements GetExtraPackagesRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(props: { accountId: number }): Promise<Result[]> {
    try {
      return await this.prisma.extraPackages.findMany({
        where: {
          OR: [
            {
              status: true,
              ExtraPackageOnPlans: {
                some: { Plan: { Account: { some: { id: props.accountId } } } },
              },
            },
            { status: true, allPlans: true },
          ],
        },
        select: {
          id: true,
          name: true,
          type: true,
          periodValidityEnd: true,
          periodValidityStart: true,
          amount: true,
          cycle: true,
          price: true,
          createAt: true,
          newSubscribers: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get checkpoint fetchAlreadyExists`.");
    }
  }
}

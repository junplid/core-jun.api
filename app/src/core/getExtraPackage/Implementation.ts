import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetExtraPackageRepository_I, Result } from "./Repository";

export class GetExtraPackageImplementation
  implements GetExtraPackageRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(props: {
    accountId: number;
    id: number;
  }): Promise<Result | null> {
    try {
      return await this.prisma.extraPackages.findFirst({
        where: {
          OR: [
            {
              id: props.id,
              status: true,
              ExtraPackageOnPlans: {
                some: { Plan: { Account: { some: { id: props.accountId } } } },
              },
            },
            { status: true, allPlans: true, id: props.id },
          ],
        },
        select: {
          id: true,
          name: true,
          type: true,
          amount: true,
          cycle: true,
          price: true,
          description: true,
          textOnPage: true,
          newSubscribers: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get checkpoint fetchAlreadyExists`.");
    }
  }
}

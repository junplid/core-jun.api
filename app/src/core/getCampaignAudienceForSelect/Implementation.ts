import { Prisma, PrismaClient } from "@prisma/client";
import { GetCampaignAudienceForSelectRepository_I, Props } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetCampaignAudienceForSelectImplementation
  implements GetCampaignAudienceForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch({ businessIds, accountId, type }: Props): Promise<
    {
      name: string;
      id: number;
    }[]
  > {
    try {
      return await this.prisma.audience.findMany({
        where: {
          type: { in: type },
          accountId,
          ...(businessIds?.length && {
            AudienceOnBusiness: {
              some: {
                businessId: { in: businessIds },
              },
            },
          }),
        },
        select: {
          name: true,
          id: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get checkpoint fetchAlreadyExists`.");
    }
  }
}

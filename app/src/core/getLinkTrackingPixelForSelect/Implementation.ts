import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  GetLinkTrackingPixelForSelectRepository_I,
  Result,
} from "./Repository";

export class GetLinkTrackingPixelForSelectImplementation
  implements GetLinkTrackingPixelForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(props: {
    accountId: number;
    businessIds?: number[];
  }): Promise<Result[]> {
    try {
      const data = await this.prisma.linkTrackingPixel.findMany({
        where: {
          accountId: props.accountId,
          businessId: { in: props.businessIds },
        },
        select: {
          id: true,
          name: true,
          Business: { select: { name: true } },
        },
      });

      return data.map(({ Business, ...d }) => ({
        ...d,
        business: Business.name,
      }));
    } catch (error) {
      console.log(error);
      throw new Error("Erro `fetch VariableBusiness`.");
    }
  }
}

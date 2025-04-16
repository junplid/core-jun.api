import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  GetConnectionsOnBusinessForSelectRepository_I,
  ResultFetch,
} from "./Repository";
import { Prisma, PrismaClient, TypeConnetion } from "@prisma/client";

export class GetConnectionsOnBusinessForSelectImplementation
  implements GetConnectionsOnBusinessForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(where: {
    accountId: number;
    businessIds?: number[];
    type?: TypeConnetion;
  }): Promise<ResultFetch[]> {
    try {
      // const data = await this.prisma.connectionOnBusiness.findMany({
      //   where: {
      //     ...(where.type && {
      //       type: where.type,
      //     }),
      //     ...(where.businessIds &&
      //       where.businessIds.length && {
      //         businessId: { in: where.businessIds },
      //       }),
      //     Business: {
      //       accountId: where.accountId,
      //     },
      //   },
      //   select: {
      //     id: true,
      //     name: true,
      //     Business: { select: { name: true } },
      //   },
      // });

      // return data.map((c) => ({
      //   id: c.id,
      //   name: `${c.name} - ${c.Business.name}`,
      // }));
      return [];
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Parameters`.");
    }
  }
}

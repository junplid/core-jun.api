import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetConnectionWARepository_I, IConn } from "./Repository";

export class GetConnectionWAImplementation
  implements GetConnectionWARepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(connWAId: number): Promise<IConn | null> {
    try {
      const data = await this.prisma.connectionOnBusiness.findUnique({
        where: { id: connWAId },
        select: {
          name: true,
          type: true,
          id: true,
          countShots: true,
          updateAt: true,
          number: true,
          _count: { select: { Tickets: true } },
          Chatbot: { select: { name: true } },
          ConnectionOnCampaign: {
            select: {
              CampaignOnBusiness: {
                select: {
                  Campaign: {
                    select: {
                      status: true,
                      isOndemand: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
            },
          },
          Business: { select: { name: true } },
          createAt: true,
        },
      });

      return data;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Connection`.");
    }
  }
}

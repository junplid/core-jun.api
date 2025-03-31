import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetFunnelKanbansRepository_I, ResultGet } from "./Repository";

export class GetFunnelKanbansImplementation
  implements GetFunnelKanbansRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async get(props: { accountId: number }): Promise<ResultGet> {
    try {
      const data = await this.prisma.funnelKanban.findMany({
        where: props,
        select: {
          name: true,
          Business: { select: { name: true } },
          id: true,
          createAt: true,
        },
      });
      return data.map(({ Business, ...s }) => ({
        business: Business.name,
        ...s,
      }));
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get Tag Asset Data`.");
    }
  }
}

import { Prisma, PrismaClient, TypeConnetion } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { UpdateConnectionWARepository_I } from "./Repository";

export class UpdateConnectionWAImplementation
  implements UpdateConnectionWARepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async update(
    where: { id: number; accountId: number },
    data: { name?: string; businessId?: number; type?: TypeConnetion }
  ): Promise<{ business: string }> {
    try {
      const { Business } = await this.prisma.connectionOnBusiness.update({
        where: {
          id: where.id,
          Business: { accountId: where.accountId },
        },
        data,
        select: { Business: { select: { name: true } } },
      });
      return { business: Business.name };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Update Business`.");
    }
  }

  async fetchExist(props: { id: number; accountId: number }): Promise<number> {
    try {
      return await this.prisma.connectionOnBusiness.count({
        where: {
          id: props.id,
          Business: { accountId: props.accountId },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch business`.");
    }
  }
}

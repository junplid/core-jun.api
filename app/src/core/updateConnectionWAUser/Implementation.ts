import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { IDataUpdate, UpdateConnectionWAUserRepository_I } from "./Repository";

export class UpdateConnectionWAUserImplementation
  implements UpdateConnectionWAUserRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async update(
    where: { id: number; accountId: number },
    data: IDataUpdate
  ): Promise<void> {
    try {
      await this.prisma.connectionConfig.upsert({
        where: {
          connectionId: where.id,
          ConnectionOnBusiness: { Business: { accountId: where.accountId } },
        },
        create: { connectionId: where.id, ...data },
        update: data,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Update Business`.");
    }
  }

  async updateNumber(id: number, number: string): Promise<void> {
    try {
      await this.prisma.connectionOnBusiness.update({
        where: { id },
        data: { number },
      });
    } catch (error) {
      throw new Error("Erro `Update Business`.");
    }
  }

  async fetchExist(props: {
    id: number;
    accountId: number;
  }): Promise<{ number: string | null } | null> {
    try {
      return await this.prisma.connectionOnBusiness.findFirst({
        where: {
          id: props.id,
          Business: { accountId: props.accountId },
        },
        select: { number: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch business`.");
    }
  }
}

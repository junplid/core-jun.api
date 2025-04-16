import { Prisma, PrismaClient } from "@prisma/client";
import { UpdateDisconnectConnectionWhatsappRepository_I } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class UpdateDisconnectConnectionWhatsappImplementation
  implements UpdateDisconnectConnectionWhatsappRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetchExist(props: { id: number; accountId: number }): Promise<number> {
    try {
      return await this.prisma.connectionWA.count({
        where: {
          id: props.id,
          Business: { accountId: props.accountId },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

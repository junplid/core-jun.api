import { Prisma, PrismaClient, TypeConnetion } from "@prisma/client";
import { DeleteConnectionWhatsappRepository_I } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class DeleteConnectionWhatsappImplementation
  implements DeleteConnectionWhatsappRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async alreadyExists(props: {
    id: number;
    accountId: number;
  }): Promise<{ name: string; type: TypeConnetion } | null> {
    try {
      const data = await this.prisma.connectionWA.findFirst({
        where: {
          id: props.id,
          Business: { accountId: props.accountId },
        },
        select: { name: true, type: true },
      });

      return data;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Delete connection whatsapp`.");
    }
  }

  async delete(props: { id: number; accountId: number }): Promise<void> {
    try {
      await this.prisma.connectionWA.delete({
        where: {
          id: props.id,
          Business: { accountId: props.accountId },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Delete connection whatsapp`.");
    }
  }
}

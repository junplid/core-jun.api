import { Prisma, PrismaClient, TypeConnetion } from "@prisma/client";
import { CreateConnectionWhatsappRepository_I } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class CreateConnectionWhatsappImplementation
  implements CreateConnectionWhatsappRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetchExistWithThisName(props: {
    name: string;
    businessId: number;
    type: TypeConnetion;
  }): Promise<number> {
    try {
      const data = await this.prisma.connectionOnBusiness.count({
        where: props,
      });

      return data;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Connection`.");
    }
  }

  async create(props: {
    name: string;
    businessId: number;
    type: TypeConnetion;
  }): Promise<{ idConnection: number; createAt: Date; business: string }> {
    try {
      const { Business, ...data } =
        await this.prisma.connectionOnBusiness.create({
          data: props,
          select: {
            id: true,
            createAt: true,
            Business: { select: { name: true } },
          },
        });

      return {
        idConnection: data.id,
        createAt: data.createAt,
        business: Business.name,
      };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Connection`.");
    }
  }
}

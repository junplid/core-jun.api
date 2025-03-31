import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { UpdateAffiliateRepository_I, IUpdateProps } from "./Repository";

export class UpdateAffiliateImplementation
  implements UpdateAffiliateRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async createContactWA(data: {
    idd: string;
    ddd: string;
    localNumber: string;
    completeNumber: string;
  }): Promise<{ readonly contactWAId: number }> {
    try {
      const isExist = await this.prisma.contactsWA.findFirst({
        where: { completeNumber: data.completeNumber },
        select: { id: true },
      });
      if (isExist) return { contactWAId: isExist.id };
      const { id } = await this.prisma.contactsWA.create({
        data,
        select: { id: true },
      });
      return { contactWAId: id };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account`.");
    }
  }

  async update({ status, id, ...props }: IUpdateProps): Promise<void> {
    try {
      await this.prisma.affiliates.update({
        where: { id },
        data: { ...props, ...(status !== undefined && { status: !!status }) },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Delete Account`.");
    }
  }
}

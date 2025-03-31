import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { DeleteDocumentContactAccountFileRepository_I } from "./Repository";

export class DeleteDocumentContactAccountFileImplementation
  implements DeleteDocumentContactAccountFileRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async deleteD(id: number): Promise<{ name: string | undefined }> {
    try {
      const dd = await this.prisma.documentsOnContact.findFirst({
        where: { id },
        select: { name: true },
      });
      if (!dd?.name) return { name: undefined };

      await this.prisma.documentsOnContact.delete({
        where: { id },
      });
      return { name: dd.name };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Business`.");
    }
  }
}

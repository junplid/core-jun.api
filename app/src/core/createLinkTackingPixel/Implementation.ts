import { Prisma, PrismaClient } from "@prisma/client";
import { CreateLinkTackingPixelRepository_I, Props } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class CreateLinkTackingPixelImplementation
  implements CreateLinkTackingPixelRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetchAlreadyExists(
    props: Omit<Props, "link" | "numberOfExecutions">
  ): Promise<number> {
    try {
      return await this.prisma.linkTrackingPixel.count({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `fetchAlreadyExists LinkTackingPixel`.");
    }
  }

  async create(
    props: Props
  ): Promise<{ createAt: Date; id: number; business: string }> {
    try {
      const { Business, ...rest } = await this.prisma.linkTrackingPixel.create({
        data: props,
        select: {
          createAt: true,
          id: true,
          Business: {
            select: {
              name: true,
            },
          },
        },
      });
      return { ...rest, business: Business.name };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}

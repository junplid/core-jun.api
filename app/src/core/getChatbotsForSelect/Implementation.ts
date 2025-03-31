import { Prisma, PrismaClient } from "@prisma/client";
import { GetChabotsForSelectRepository_I, Props } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetChabotsForSelectImplementation
  implements GetChabotsForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch({ businessIds, ...props }: Props): Promise<
    {
      name: string;
      id: number;
      connectionOnBusinessId: number | null;
      status: boolean | null;
    }[]
  > {
    try {
      return await this.prisma.chatbot.findMany({
        where: {
          ...props,
          ...(businessIds?.length && {
            businessId: { in: businessIds },
          }),
        },
        select: {
          name: true,
          id: true,
          connectionOnBusinessId: true,
          status: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get checkpoint fetchAlreadyExists`.");
    }
  }
}

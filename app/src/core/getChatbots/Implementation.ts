import { Prisma, PrismaClient, TypeActivation } from "@prisma/client";
import { GetChabotsRepository_I, Result } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetChabotsImplementation implements GetChabotsRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch({
    accountId,
    type,
  }: {
    accountId: number;
    type?: TypeActivation[];
  }): Promise<Result[]> {
    try {
      const data = await this.prisma.chatbot.findMany({
        where: {
          accountId,
          ...(type?.length && { typeActivation: { in: type } }),
        },
        select: {
          name: true,
          id: true,
          createAt: true,
          description: true,
          status: true,
          typeActivation: true,
          inputActivation: true,
          ConnectionOnBusiness: { select: { id: true, number: true } },
          Business: { select: { name: true } },
        },
      });

      return data.map(({ Business, ...d }) => ({
        ...d,
        business: Business.name,
      }));
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get checkpoint fetchAlreadyExists`.");
    }
  }
}

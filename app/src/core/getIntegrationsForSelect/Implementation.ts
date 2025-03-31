import { Prisma, PrismaClient, TypeIntegrations } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetIntegrationsForSelectRepository_I, ResultGet } from "./Repository";

export class GetIntegrationsForSelectImplementation
  implements GetIntegrationsForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async get(props: {
    accountId: number;
    type?: TypeIntegrations;
  }): Promise<ResultGet[]> {
    try {
      const data = await this.prisma.integrations.findMany({
        where: {
          accountId: props.accountId,
          ...(props.type && { type: props.type }),
        },
        orderBy: { id: "desc" },
        select: {
          name: true,
          id: true,
        },
      });
      return data;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get Tag Asset Data`.");
    }
  }
}

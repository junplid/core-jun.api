import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  GetEmailServiceConfigurationForSelectRepository_I,
  Result,
} from "./Repository";

export class GetEmailServiceConfigurationForSelectImplementation
  implements GetEmailServiceConfigurationForSelectRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(props: {
    accountId: number;
    businessIds?: number[];
  }): Promise<Result[]> {
    try {
      return await this.prisma.emailServiceConfiguration.findMany({
        where: {
          accountId: props.accountId,
          EmailServiceConfigurationOnBusiness: {
            some: {
              businessId: {
                in: props.businessIds,
              },
            },
          },
        },
        select: {
          id: true,
          host: true,
          user: true,
          port: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `fetch VariableBusiness`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  GetEmailsServicesConfigurationRepository_I,
  Result,
} from "./Repository";

export class GetEmailsServicesConfigurationImplementation
  implements GetEmailsServicesConfigurationRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(props: { accountId: number }): Promise<Result[]> {
    try {
      const data = await this.prisma.emailServiceConfiguration.findMany({
        where: props,
        select: {
          id: true,
          host: true,
          user: true,
          createAt: true,
          port: true,
          EmailServiceConfigurationOnBusiness: {
            select: {
              Business: {
                select: { name: true },
              },
            },
          },
        },
      });

      return data.map(({ EmailServiceConfigurationOnBusiness, ...d }) => ({
        ...d,
        business: EmailServiceConfigurationOnBusiness.map(
          (b) => b.Business.name
        ).join(", "),
      }));
    } catch (error) {
      console.log(error);
      throw new Error("Erro `fetch VariableBusiness`.");
    }
  }
}

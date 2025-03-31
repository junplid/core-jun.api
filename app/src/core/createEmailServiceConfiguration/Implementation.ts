import { Prisma, PrismaClient } from "@prisma/client";
import {
  CreateEmailServiceConfigurationRepository_I,
  PropsCreate,
} from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class CraetoEmailServiceConfigurationImplementation
  implements CreateEmailServiceConfigurationRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async create({ businessIds, ...data }: PropsCreate): Promise<{
    readonly createAt: Date;
    readonly updateAt: Date;
    readonly id: number;
    readonly business: string;
  }> {
    try {
      const { EmailServiceConfigurationOnBusiness, ...newEmail } =
        await this.prisma.emailServiceConfiguration.create({
          data: {
            ...data,
            EmailServiceConfigurationOnBusiness: {
              createMany: {
                data: businessIds.map((businessId) => ({ businessId })),
              },
            },
          },
          select: {
            id: true,
            createAt: true,
            updateAt: true,
            EmailServiceConfigurationOnBusiness: {
              select: {
                Business: {
                  select: { name: true },
                },
              },
            },
          },
        });
      return {
        ...newEmail,
        business: EmailServiceConfigurationOnBusiness.map(
          (b) => b.Business.name
        ).join(", "),
      };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Business`.");
    }
  }

  async fetchExist({
    businessIds,
    ...props
  }: {
    host: string;
    user: string;
    accountId: number;
    businessIds: number[];
  }): Promise<number> {
    try {
      return await this.prisma.emailServiceConfiguration.count({
        where: {
          ...props,
          EmailServiceConfigurationOnBusiness: {
            some: { businessId: { in: businessIds } },
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch business`.");
    }
  }
}

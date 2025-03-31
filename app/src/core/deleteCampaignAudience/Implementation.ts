import { Prisma, PrismaClient } from "@prisma/client";
import {
  DeleteCampaignAudienceRepository_I,
  PropsFetchExist,
} from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class CraeteCompanyImplementation
  implements DeleteCampaignAudienceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async delete(props: PropsFetchExist): Promise<void> {
    try {
      await this.prisma.audience.delete({
        where: {
          id: props.id,
          AudienceOnBusiness: {
            every: {
              Business: {
                accountId: props.accountId,
              },
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  async fetchExist(props: PropsFetchExist): Promise<number> {
    try {
      return this.prisma.audience.count({
        where: {
          id: props.id,
          AudienceOnBusiness: {
            every: {
              Business: {
                accountId: props.accountId,
              },
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

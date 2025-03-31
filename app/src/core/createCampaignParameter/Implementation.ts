import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  CreateParameterRepository_I,
  PropsCreate,
  PropsFetchExist,
} from "./Repository";

export class CraeteCompanyImplementation
  implements CreateParameterRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async create({
    rangeId,
    timesWork,
    ...data
  }: PropsCreate): Promise<{ campaignParameterId: number; createAt: Date }> {
    try {
      const { id, createAt } = await this.prisma.campaignParameter.create({
        data: {
          ...data,
          rootCampaignParameterRangesConfigId: rangeId,
          ...(timesWork?.length && {
            TimesWork: {
              createMany: {
                data: timesWork.map((s) => ({
                  ...s,
                  type: "campaign_parameter",
                })),
              },
            },
          }),
        },
        select: { id: true, createAt: true },
      });
      return { campaignParameterId: id, createAt };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  async fetchExist(props: PropsFetchExist): Promise<number> {
    try {
      return await this.prisma.campaignParameter.count({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

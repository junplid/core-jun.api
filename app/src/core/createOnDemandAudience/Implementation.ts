import { Prisma, PrismaClient } from "@prisma/client";
import {
  CreateOnDemandAudienceRepository_I,
  PropsCreate,
  PropsFetchExist,
  Result,
} from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class CreateOnDemandAudienceImplementation
  implements CreateOnDemandAudienceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetchExist(props: PropsFetchExist): Promise<number> {
    try {
      return await this.prisma.audience.count({
        where: {
          name: props.name,
          AudienceOnBusiness: {
            some: {
              Business: { accountId: props.accountId },
              id: { in: props.businessIds },
            },
          },
          type: "ondemand",
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `fetchExist`.");
    }
  }

  async create(props: PropsCreate): Promise<Result> {
    try {
      const data = await this.prisma.audience.create({
        data: {
          accountId: props.accountId,
          name: props.name,
          type: "ondemand",
          AudienceOnBusiness: {
            createMany: {
              data: props.businessIds.map((businessId) => ({ businessId })),
            },
          },
          ...(props.tagOnBusinessId?.length && {
            TagOnBusinessOnCampaignAudience: {
              createMany: {
                data: props.tagOnBusinessId.map((t) => ({
                  tagOnBusinessId: t,
                })),
                skipDuplicates: true,
              },
            },
          }),
        },
        select: {
          createAt: true,
          id: true,
          TagOnBusinessOnAudience: {
            select: {
              TagOnBusiness: {
                select: {
                  Tag: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          AudienceOnBusiness: {
            select: {
              Business: {
                select: {
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              ContactsWAOnAccountOnAudience: true,
            },
          },
        },
      });
      return {
        id: data.id,
        business: data.AudienceOnBusiness.map((b) => b.Business.name).join(
          ", "
        ),
        createAt: data.createAt,
        tags: data.TagOnBusinessOnAudience.map(
          (t) => t.TagOnBusiness.Tag.name
        ).join(", "),
        countContacts: data._count.ContactsWAOnAccountOnAudience,
      };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `create businessOnCampaignAudience`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import {
  CreateImportCampaignAudienceRepository_I,
  PropsCheckContactsWA,
  PropsCreate,
  PropsFetchExist,
  Result,
} from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class CreateImportCampaignAudienceImplementation
  implements CreateImportCampaignAudienceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async checkIfContactWAIsContactWAOnAccount(
    props: PropsCheckContactsWA
  ): Promise<number> {
    try {
      return await this.prisma.contactsWAOnAccount.count({
        where: {
          accountId: props.accountId,
          id: props.contactsWAOnAccountId,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `checkIfContactWAIsContactWAOnAccount`.");
    }
  }

  async fetchExist(props: PropsFetchExist): Promise<number> {
    try {
      return await this.prisma.audienceOnBusiness.count({
        where: {
          Business: {
            accountId: props.accountId,
            id: { in: props.businessId },
          },
          Audience: {
            name: props.name,
            type: "import",
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `fetchExist`.");
    }
  }

  async create({ businessId, ...props }: PropsCreate): Promise<Result> {
    try {
      const data = await this.prisma.audience.create({
        data: {
          accountId: props.accountId,
          name: props.name,
          type: "import",
          AudienceOnBusiness: {
            createMany: {
              data: businessId.map((b) => ({ businessId: b })),
            },
          },
          ...(props.contactsWAOnAccountIds.length && {
            ContactsWAOnAccountOnAudience: {
              createMany: {
                data: props.contactsWAOnAccountIds.map((cId) => ({
                  contactWAOnAccountId: cId,
                })),
                skipDuplicates: true,
              },
            },
          }),
          ...(props.tagOnBusinessId?.length && {
            TagOnBusinessOnAudience: {
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
          id: true,
          createAt: true,
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

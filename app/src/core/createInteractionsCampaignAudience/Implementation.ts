import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  CreateInteractionsCampaignAudienceRepository_I,
  PropsCreate,
  PropsFetch,
  Result,
} from "./Repository";

export class CreateInteractionsCampaignAudienceImplementation
  implements CreateInteractionsCampaignAudienceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(props: PropsFetch): Promise<{ contactWAOnAccountId: number }[]> {
    try {
      const data = await this.prisma.contactsWAOnAccount.findMany({
        where: {
          accountId: props.accountId,
          ContactsWAOnAccountOnAudience: {
            some: {
              ...(props.sources && {
                Audience: {
                  ...((props.sources.business?.length ||
                    props.sources.audiences?.length) && {
                    AudienceOnBusiness: {
                      some: {
                        ...(props.sources.business?.length && {
                          businessId: { in: props.sources?.business },
                        }),
                        ...(props.sources.audiences?.length && {
                          id: { in: props.sources?.audiences },
                        }),
                      },
                    },
                  }),
                  ...(props.sources.campaigns?.length && {
                    AudienceOnCampaign: {
                      some: {
                        Campaign: {
                          id: { in: props.sources?.campaigns },
                        },
                      },
                    },
                  }),
                },
              }),
              ...(props.filters && {
                ContactsWAOnAccount: {
                  ...(props.filters.tagsContacts?.length && {
                    TagOnBusinessOnContactsWAOnAccount: {
                      some: {
                        tagOnBusinessId: { in: props.filters.tagsContacts },
                      },
                    },
                  }),
                  ...(props.filters.variables?.length && {
                    ContactsWAOnAccountVariableOnBusiness: {
                      some: {
                        OR: props.filters.variables.map(
                          ({ id, possibleValues }) => ({
                            VariableOnBusiness: { variableId: id },
                            value: { in: possibleValues },
                          })
                        ),
                      },
                    },
                  }),
                },
              }),
            },
          },
        },
        select: { id: true },
      });
      return data.map((d) => ({ contactWAOnAccountId: d.id }));
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Aggregation`.");
    }
  }

  async create(props: PropsCreate): Promise<Result> {
    try {
      const data = await this.prisma.audience.create({
        data: {
          accountId: props.accountId,
          name: props.name,
          type: "interactions",
          AudienceOnBusiness: {
            createMany: {
              data: props.businessIds.map((businessId) => ({ businessId })),
            },
          },
          ContactsWAOnAccountOnAudience: {
            createMany: { data: props.contacts },
          },
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

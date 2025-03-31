import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  CreateAggregationCampaignAudienceRepository_I,
  PropsFetch,
} from "./Repository";

export class CreateAggregationCampaignAudienceImplementation
  implements CreateAggregationCampaignAudienceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(props: PropsFetch): Promise<number> {
    try {
      return await this.prisma.contactsWAOnAccount.count({
        where: {
          accountId: props.accountId,
          ContactsWAOnAccountOnAudience: {
            some: {
              ...(props.sources && {
                Audience: {
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
              ContactsWAOnAccount: {
                ...(props.filters && {
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
                }),
              },
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Aggregation`.");
    }
  }
}

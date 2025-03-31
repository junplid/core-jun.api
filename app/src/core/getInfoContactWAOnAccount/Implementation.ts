import { Prisma, PrismaClient } from "@prisma/client";
import { GetContactWAOnAccountRepository_I, ResultFetch } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { ModelFlows } from "../../adapters/mongo/models/flows";

export class GetContactWAOnAccountOnAccountImplementation
  implements GetContactWAOnAccountRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetchContactWAOnAccount(props: {
    accountId: number;
    id: number;
  }): Promise<ResultFetch[]> {
    try {
      const data = await this.prisma.contactsWAOnAccount.findMany({
        where: props,
        select: {
          name: true,
          updateAt: true,
          id: true,
          ContactsWA: {
            select: {
              ddd: true,
              idd: true,
              completeNumber: true,
              localNumber: true,
            },
          },
          TagOnBusinessOnContactsWAOnAccount: {
            select: {
              TagOnBusiness: {
                select: {
                  Tag: {
                    select: { name: true, id: true },
                  },
                },
              },
            },
          },
          ContactsWAOnAccountVariableOnBusiness: {
            select: {
              value: true,
              VariableOnBusiness: {
                select: {
                  Variable: {
                    select: {
                      name: true,
                      id: true,
                    },
                  },
                },
              },
            },
          },
          ContactsWAOnAccountOnAudience: {
            select: {
              ContactsWAOnAccountOnAudienceOnCampaign: {
                select: {
                  isSent: true,
                  isFinish: true,
                  Campaign: {
                    select: {
                      id: true,
                      flowId: true,
                      name: true,
                      status: true,
                    },
                  },
                },
              },
              Audience: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
          CheckPointOnBusinessOnContactsWAOnAccount: {
            select: {
              createAt: true,
              CheckPointOnBusiness: {
                select: {
                  CheckPoint: {
                    select: {
                      name: true,
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      return await Promise.all(
        data.map(async (cWAA) => ({
          name: cWAA.name,
          updateAt: cWAA.updateAt,
          id: cWAA.id,
          ...cWAA.ContactsWA,
          checkPoints: cWAA.CheckPointOnBusinessOnContactsWAOnAccount.map(
            ({ CheckPointOnBusiness, createAt }) => ({
              ...CheckPointOnBusiness.CheckPoint,
              createAt,
            })
          ),
          tags: cWAA.TagOnBusinessOnContactsWAOnAccount.map(
            ({ TagOnBusiness }) => TagOnBusiness.Tag
          ),
          variables: cWAA.ContactsWAOnAccountVariableOnBusiness.map(
            ({ VariableOnBusiness, ...vari }) => ({
              ...vari,
              name: VariableOnBusiness.Variable.name,
              id: VariableOnBusiness.Variable.id,
            })
          ),
          audiences: await Promise.all(
            cWAA.ContactsWAOnAccountOnAudience.map(
              async ({
                Audience,
                ContactsWAOnAccountOnAudienceOnCampaign,
              }) => ({
                ...Audience,
                campaigns: await Promise.all(
                  ContactsWAOnAccountOnAudienceOnCampaign.map(
                    async ({ Campaign, ...rest }) => {
                      const { flowId, ...campaign } = Campaign;
                      const flow = await ModelFlows.findOne({
                        _id: flowId,
                      }).select("name");
                      return {
                        ...rest,
                        ...campaign,
                        flow: {
                          name: flow?.name,
                          id: Campaign.flowId,
                        },
                      };
                    }
                  )
                ),
              })
            )
          ),
        }))
      );
    } catch (error) {
      throw new Error("Method not implemented.");
    }
  }
}

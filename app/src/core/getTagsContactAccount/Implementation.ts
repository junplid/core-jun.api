import { Prisma, PrismaClient, TypeVariable } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetTagsContactAccountRepository_I, Result } from "./Repository";

export class GetTagsContactAccountImplementation
  implements GetTagsContactAccountRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(props: {
    accountId: number;
    ticketId?: number;
    contactAccountId?: number;
    businessId?: number;
  }): Promise<Result[]> {
    try {
      const dd = await this.prisma.tagOnBusinessOnContactsWAOnAccount.findMany({
        where: {
          ...(props.businessId && {
            TagOnBusiness: { businessId: props.businessId },
          }),
          ContactsWAOnAccount: {
            accountId: props.accountId,
            ...(props.contactAccountId && {
              id: props.contactAccountId,
            }),
            ...(props.ticketId && {
              Tickets: { some: { id: props.ticketId } },
            }),
          },
        },
        select: {
          TagOnBusiness: {
            select: { Tag: { select: { name: true, id: true } } },
          },
        },
      });

      return dd.map(({ TagOnBusiness }) => {
        return { id: TagOnBusiness.Tag.id, name: TagOnBusiness.Tag.name };
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `fetch VariablesContactAccount`.");
    }
  }
}

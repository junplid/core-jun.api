import { Prisma, PrismaClient, TypeVariable } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetVariablesContactAccountRepository_I, Result } from "./Repository";

export class GetVariablesContactAccountImplementation
  implements GetVariablesContactAccountRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(props: {
    accountId: number;
    ticketId?: number;
    businessId?: number;
  }): Promise<Result[]> {
    try {
      const dd =
        await this.prisma.contactsWAOnAccountVariableOnBusiness.findMany({
          where: {
            ...(props.businessId && {
              VariableOnBusiness: { businessId: props.businessId },
            }),
            ContactsWAOnAccount: {
              accountId: props.accountId,
              ...(props.ticketId && {
                Tickets: { some: { id: props.ticketId } },
              }),
            },
          },
          select: {
            value: true,
            VariableOnBusiness: {
              select: { Variable: { select: { name: true, id: true } } },
            },
          },
        });

      return dd.map(({ VariableOnBusiness, value }) => {
        return { ...VariableOnBusiness.Variable, value };
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `fetch VariablesContactAccount`.");
    }
  }
}

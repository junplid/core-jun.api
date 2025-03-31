import { Prisma, PrismaClient, TypeVariable } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  GetVariablesForSelectHumanServiceRepository_I,
  ResultGet,
} from "./Repository";

export class GetVariablesForSelectHumanServiceImplementation
  implements GetVariablesForSelectHumanServiceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async get(props: {
    userId: number;
    name?: string;
    ticketId?: number;
  }): Promise<ResultGet[]> {
    try {
      const data = await this.prisma.variable.findMany({
        where: {
          type: "dynamics",
          name: { contains: props.name },
          VariableOnBusiness: {
            some: {
              ...(props.ticketId && {
                ContactsWAOnAccountVariableOnBusiness: {
                  some: {
                    ContactsWAOnAccount: {
                      Tickets: { some: { id: props.ticketId } },
                    },
                  },
                },
              }),
              Business: { SectorsAttendants: { some: { id: props.userId } } },
            },
          },
        },
        orderBy: { id: "desc" },
        select: { name: true, id: true },
      });
      return data.map((v) => v);
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get variaveis`.");
    }
  }
}

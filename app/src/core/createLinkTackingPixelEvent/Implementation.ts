import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { CreateLinkTackingPixelEventRepository_I, Props } from "./Repository";

export class CreateLinkTackingPixelEventImplementation
  implements CreateLinkTackingPixelEventRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async create(props: Props): Promise<void> {
    try {
      await this.prisma.linkTrackingPixelEvents.create({
        data: props,
        select: {
          Campaign: {
            select: {
              flowId: true,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }

  async findFlow(props: {
    flowId: string;
    accountId: number;
  }): Promise<{ edges: any; nodes: any } | null> {
    try {
      const flowFetch = await ModelFlows.aggregate([
        {
          $match: {
            accountId: props.accountId,
            _id: props.flowId,
          },
        },
        {
          $project: {
            nodes: {
              $map: {
                input: "$data.nodes",
                in: {
                  id: "$$this.id",
                  type: "$$this.type",
                  data: "$$this.data",
                },
              },
            },
            edges: {
              $map: {
                input: "$data.edges",
                in: {
                  id: "$$this.id",
                  source: "$$this.source",
                  target: "$$this.target",
                  sourceHandle: "$$this.sourceHandle",
                },
              },
            },
          },
        },
      ]);
      if (!flowFetch) return null;
      const { edges, nodes } = flowFetch[0];
      return { edges, nodes };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }

  async findInfo(props: { contactsWAOnAccountId: number }): Promise<{
    numberLead: string;
  } | null> {
    try {
      const data = await this.prisma.contactsWAOnAccount.findFirst({
        where: {
          id: props.contactsWAOnAccountId,
        },
        select: {
          ContactsWA: {
            select: {
              completeNumber: true,
            },
          },
        },
      });
      return data ? { numberLead: data.ContactsWA.completeNumber } : null;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }

  async findInfoConnection(
    connectionWhatsId: number
  ): Promise<{ number: string | null; businessName: string } | null> {
    try {
      const data = await this.prisma.connectionOnBusiness.findUnique({
        where: { id: connectionWhatsId },
        select: {
          number: true,
          Business: {
            select: { name: true },
          },
        },
      });
      if (data)
        return {
          businessName: data.Business.name,
          number: data.number,
        };
      return null;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}

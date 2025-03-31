import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  CreateReturn,
  CreateSectorRepository_I,
  PropsCreate,
} from "./Repository";

export class CraeteSectorImplementation implements CreateSectorRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async create({
    lackResponse,
    sectorsMessages,
    sectorsAttendantsIds,
    allowedConnections,
    ...data
  }: PropsCreate): Promise<CreateReturn> {
    try {
      const { Business, _count, ...rest } = await this.prisma.sectors.create({
        data: {
          ...data,
          ...(lackResponse && {
            LackResponses: {
              create: { ...lackResponse, accountId: data.accountId },
            },
          }),
          SectorsMessages: {
            create: { ...sectorsMessages, accountId: data.accountId },
          },
          ...(sectorsAttendantsIds?.length && {
            SectorsAttendants: {
              connect: sectorsAttendantsIds.map((id) => ({ id })),
            },
          }),
          ...(!!allowedConnections?.length && {
            SectorsOnConnections: {
              createMany: {
                data: allowedConnections.map((connectionId) => ({
                  connectionId,
                })),
              },
            },
          }),
        },
        select: {
          id: true,
          createAt: true,
          Business: { select: { name: true } },
          _count: { select: { SectorsAttendants: true } },
        },
      });
      return {
        ...rest,
        business: Business.name,
        countSectorsAttendants: _count.SectorsAttendants,
      };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Sector`.");
    }
  }

  async fetchExist(props: {
    name: string;
    accountId: number;
    businessId: number;
  }): Promise<number> {
    try {
      return await this.prisma.sectors.count({
        where: {
          name: props.name,
          accountId: props.accountId,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Sector`.");
    }
  }
}

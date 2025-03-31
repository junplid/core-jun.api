import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { LoginHumanServiceRepository_I } from "./Repository";

export class LoginHumanServiceImplementation
  implements LoginHumanServiceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async findSectorsAttendants(props: { username: string }): Promise<{
    id: number;
    password: string;
    office: string;
    status: boolean;
    name: string;
    hash: string;
    sector?: {
      name: string;
      businessId: number;
      business: string;
      id: number;
    };
  } | null> {
    try {
      const data = await this.prisma.sectorsAttendants.findFirst({
        where: props,
        select: {
          id: true,
          status: true,
          password: true,
          office: true,
          name: true,
          hash: true,
          Sectors: {
            select: {
              id: true,
              name: true,
              businessId: true,
              Business: { select: { name: true } },
            },
          },
        },
      });

      if (data) {
        const { Sectors, ...rest } = data;
        return {
          ...rest,
          ...(Sectors && {
            sector: {
              business: Sectors.Business.name,
              businessId: Sectors.businessId,
              id: Sectors.id,
              name: Sectors.name,
            },
          }),
        };
      }

      return null;
    } catch (error) {
      throw new Error("Erro `Find Account Login`.");
    }
  }

  async findSupervisors(props: { username: string }): Promise<{
    id: number;
    password: string;
    name: string;
    hash: string;
    sector: {
      name: string;
      business: string;
      businessId?: number;
      id: number;
    }[];
  } | null> {
    try {
      const data = await this.prisma.supervisors.findFirst({
        where: props,
        select: {
          id: true,
          password: true,
          hash: true,
          name: true,
          Sectors: {
            select: {
              businessId: true,
              name: true,
              id: true,
              Business: {
                select: { name: true },
              },
            },
          },
        },
      });

      return data
        ? {
            id: data.id,
            password: data.password,
            name: data.name,
            hash: data.hash,
            sector: data.Sectors?.map((e) => ({
              name: e.name,
              businessId: e.businessId,
              business: e.Business.name,
              id: e.id,
            })),
          }
        : null;
    } catch (error) {
      throw new Error("Erro `Find Account Login`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import { CreateSupervisorRepository_I, Props } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class CreateSupervisorImplementation
  implements CreateSupervisorRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async create({
    businessIds,
    sectorIds,
    ...props
  }: Props): Promise<{ createAt: Date; id: number; business: string }> {
    try {
      const { BusinessOnSupervisors, ...data } =
        await this.prisma.supervisors.create({
          data: {
            ...props,
            BusinessOnSupervisors: {
              createMany: {
                data: businessIds.map((businessId) => ({ businessId })),
              },
            },
            ...(sectorIds?.length && {
              Sectors: { connect: sectorIds.map((id) => ({ id })) },
            }),
          },
          select: {
            createAt: true,
            id: true,
            BusinessOnSupervisors: {
              select: {
                Business: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });

      return {
        ...data,
        business: BusinessOnSupervisors.map((b) => b.Business.name).join(", "),
      };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}

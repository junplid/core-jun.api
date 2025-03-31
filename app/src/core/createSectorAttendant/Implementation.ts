import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  CreateSectorAttendantRepository_I,
  Props,
  PropsCreate,
  ResultCreateAttendant,
} from "./Repository";

export class CreateSectorAttendantImplementation
  implements CreateSectorAttendantRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetchAlreadyExists(props: Props): Promise<number> {
    try {
      return await this.prisma.sectorsAttendants.count({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }

  async create({
    businessId,
    ...props
  }: PropsCreate): Promise<ResultCreateAttendant> {
    try {
      const { Business, Sectors, ...data } =
        await this.prisma.sectorsAttendants.create({
          data: { ...props, businessId },
          select: {
            createAt: true,
            id: true,
            Business: { select: { name: true } },
            Sectors: { select: { name: true } },
          },
        });
      return {
        ...data,
        business: Business.name,
        sectorName: Sectors?.name ?? "",
      };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  GetSectorsForSelectHumanServiceRepository_I,
  ResultFetch,
} from "./Repository";

export class GetSectorsForSelectHumanServiceImplementation
  implements GetSectorsForSelectHumanServiceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetchAttendant(userId: number): Promise<{ businessId: number } | null> {
    try {
      return await this.prisma.sectorsAttendants.findFirst({
        where: { id: userId },
        select: { businessId: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Parameters`.");
    }
  }

  async fetch(businessId: number): Promise<ResultFetch[]> {
    try {
      return await this.prisma.sectors.findMany({
        where: { businessId },
        select: { id: true, name: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Parameters`.");
    }
  }
}

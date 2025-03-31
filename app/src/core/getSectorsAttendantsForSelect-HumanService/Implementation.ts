import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  GetSectorsAttendantsForSelectHumanServiceRepository_I,
  IFetch,
  ResultFetch,
} from "./Repository";

export class GetSectorsAttendantsForSelectHumanServiceImplementation
  implements GetSectorsAttendantsForSelectHumanServiceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(props: IFetch): Promise<ResultFetch[]> {
    try {
      return await this.prisma.sectorsAttendants.findMany({
        where: props,
        select: { id: true, name: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Parameters`.");
    }
  }
  async getAttendent(id: number): Promise<{ businessId: number } | null> {
    try {
      return await this.prisma.sectorsAttendants.findUnique({
        where: { id },
        select: { businessId: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Parameters`.");
    }
  }
}

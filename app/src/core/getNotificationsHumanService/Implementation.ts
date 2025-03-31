import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  GetNotificationsHumanServiceRepository_I,
  ResultFetch,
} from "./Repository";

export class GetNotificationsHumanServiceImplementation
  implements GetNotificationsHumanServiceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(userId: number): Promise<ResultFetch[]> {
    try {
      return await this.prisma.notificationsSectorsAttendants.findMany({
        where: { sectorsAttendantId: userId },
        select: {
          createAt: true,
          content: true,
          subject: true,
          id: true,
          status: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Parameters`.");
    }
  }
}

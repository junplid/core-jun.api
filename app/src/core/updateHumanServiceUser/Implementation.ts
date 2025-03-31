import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  PropsAlreadyExisting,
  PropsUpdate,
  UpdateHumanServiceUserRepository_I,
} from "./Repository";

export class UpdateHumanServiceUserImplementation
  implements UpdateHumanServiceUserRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async update({ userId, type, ...props }: PropsUpdate): Promise<void> {
    try {
      // @ts-expect-error
      await this.prisma[type].update({
        where: { id: userId },
        data: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }

  async fetchExist(
    props: PropsAlreadyExisting
  ): Promise<"sectorsAttendants" | "supervisors" | null> {
    try {
      const attendant = await this.prisma.sectorsAttendants.count({
        where: { id: props.userId },
      });
      if (attendant) return "sectorsAttendants";
      const supervisor = await this.prisma.supervisors.count({
        where: { id: props.userId },
      });
      if (supervisor) return "supervisors";
      return null;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}

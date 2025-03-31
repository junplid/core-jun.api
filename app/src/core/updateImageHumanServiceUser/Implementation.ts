import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  CreateImageHumanServiceUserRepository_I,
  PropsUpdate,
} from "./Repository";

export class CreateImageHumanServiceUserImplementation
  implements CreateImageHumanServiceUserRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetchExistUser(userId: number): Promise<{
    type: "sectorsAttendants" | "supervisors";
    oldImage: string | null;
  } | null> {
    try {
      const attendant = await this.prisma.sectorsAttendants.findFirst({
        where: { id: userId },
        select: { imageName: true },
      });
      if (attendant)
        return {
          type: "sectorsAttendants",
          oldImage: attendant.imageName,
        };
      const supervisor = await this.prisma.supervisors.findFirst({
        where: { id: userId },
        select: { imageName: true },
      });
      if (supervisor)
        return {
          type: "supervisors",
          oldImage: supervisor.imageName,
        };
      return null;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }

  async update({ userId, type, ...props }: PropsUpdate): Promise<void> {
    try {
      // @ts-expect-error
      await this.prisma[type].update({
        where: { id: userId },
        data: { imageName: props.fileName },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}

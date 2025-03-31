import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  PropsUpdate,
  UpdatePasswordHumanServiceRepository_I,
} from "./Repository";

export class UpdatePasswordHumanServiceImplementation
  implements UpdatePasswordHumanServiceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async update({ accountId, password, type }: PropsUpdate): Promise<void> {
    try {
      if (type === "attendant") {
        await this.prisma.sectorsAttendants.update({
          where: { id: accountId },
          data: { password },
        });
      }
      if (type === "supervisor") {
        await this.prisma.supervisors.update({
          where: { id: accountId },
          data: { password },
        });
      }
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }

  async alreadyExisting(
    id: number,
    type: "attendant" | "supervisor"
  ): Promise<boolean> {
    try {
      if (type === "attendant") {
        return !!(await this.prisma.sectorsAttendants.findFirst({
          where: { id },
        }));
      }
      if (type === "supervisor") {
        return !!(await this.prisma.supervisors.findFirst({
          where: { id },
        }));
      }
      return false;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}

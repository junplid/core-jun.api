import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  PropsAlreadyExisting,
  PropsUpdate,
  UpdateSectorAttendantOnHumanServiceRepository_I,
} from "./Repository";

export class UpdateSectorAttendantOnHumanServiceImplementation
  implements UpdateSectorAttendantOnHumanServiceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async update({ userId, ...props }: PropsUpdate): Promise<void> {
    try {
      await this.prisma.sectorsAttendants.update({
        where: { id: userId },
        data: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }

  async alreadyExisting(props: PropsAlreadyExisting): Promise<number> {
    try {
      return await this.prisma.sectorsAttendants.count({
        where: {
          id: props.userId,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}

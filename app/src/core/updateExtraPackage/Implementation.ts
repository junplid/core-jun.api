import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  PropsAlreadyExisting,
  PropsUpdate,
  UpdateExtraPackageRepository_I,
} from "./Repository";

export class UpdateExtraPackageImplementation
  implements UpdateExtraPackageRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async update({ id, ...data }: PropsUpdate): Promise<void> {
    try {
      await this.prisma.extraPackages.update({ where: { id }, data });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }

  async alreadyExist(props: PropsAlreadyExisting): Promise<number> {
    try {
      return await this.prisma.supervisors.count({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}

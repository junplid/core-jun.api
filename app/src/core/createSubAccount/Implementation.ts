import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { ModulesPermissions } from "./DTO";
import { CreateSubAccountRepository_I } from "./Repository";

export class CraeteSubAccountImplementation
  implements CreateSubAccountRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async create({
    permissions,
    ...data
  }: {
    accountId: number;
    email: string;
    password: string;
    name: string;
    status: boolean;
    permissions?: {
      create?: Partial<ModulesPermissions>;
      delete?: Partial<ModulesPermissions>;
      update?: Partial<ModulesPermissions>;
    };
  }): Promise<{
    readonly accountId: number;
    readonly createAt: Date;
  }> {
    try {
      const { id, createAt } = await this.prisma.subAccount.create({
        data: {
          ...data,
          ...(permissions?.create && {
            SubAccountPermissionsCreate: { create: permissions.create },
          }),
          ...(permissions?.update && {
            SubAccountPermissionsUpdate: { create: permissions.update },
          }),
          ...(permissions?.delete && {
            SubAccountPermissionsDelete: { create: permissions.delete },
          }),
        },
        select: { id: true, createAt: true },
      });
      return { accountId: id, createAt };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Account Asset Data`.");
    }
  }

  async fetchAlreadyExist(props: {
    accountId: number;
    email: string;
  }): Promise<number> {
    try {
      return await this.prisma.subAccount.count({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

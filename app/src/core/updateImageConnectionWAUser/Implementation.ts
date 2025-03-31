import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  CreateImageConnectionUserRepository_I,
  PropsUpdate,
} from "./Repository";

export class CreateImageConnectionUserImplementation
  implements CreateImageConnectionUserRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetchExist(id: number): Promise<{
    oldImage?: string | null;
  } | null> {
    try {
      const data = await this.prisma.connectionOnBusiness.findFirst({
        where: { id },
        select: {
          id: true,
          ConnectionConfig: {
            select: {
              fileNameImgPerfil: true,
            },
          },
        },
      });

      if (!data) return null;
      return { oldImage: data.ConnectionConfig?.fileNameImgPerfil };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }

  async update(props: PropsUpdate): Promise<void> {
    try {
      await this.prisma.connectionConfig.upsert({
        where: {
          connectionId: props.id,
          ConnectionOnBusiness: { Business: { accountId: props.accountId } },
        },
        create: {
          connectionId: props.id,
          fileNameImgPerfil: props.fileName,
        },
        update: { fileNameImgPerfil: props.fileName },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}

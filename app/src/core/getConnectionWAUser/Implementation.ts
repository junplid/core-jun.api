import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetConnectionWAUserRepository_I, IResult } from "./Repository";

export class GetConnectionWAUserImplementation
  implements GetConnectionWAUserRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(props: {
    connectionId: number;
    accountId: number;
  }): Promise<IResult | null> {
    try {
      // const data = await this.prisma.connectionConfig.findUnique({
      //   where: {
      //     connectionId: props.connectionId,
      //     ConnectionOnBusiness: {
      //       Business: {
      //         accountId: props.accountId,
      //       },
      //     },
      //   },
      //   select: {
      //     fileNameImgPerfil: true,
      //     groupsAddPrivacy: true,
      //     imgPerfilPrivacy: true,
      //     lastSeenPrivacy: true,
      //     onlinePrivacy: true,
      //     profileName: true,
      //     profileStatus: true,
      //     readReceiptsPrivacy: true,
      //     statusPrivacy: true,
      //   },
      // });

      return null;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Connection`.");
    }
  }

  async fetchConn(id: number): Promise<boolean> {
    try {
      // return !!(await this.prisma.connectionOnBusiness.findFirst({
      //   where: { id },
      //   select: { id: true },
      // }));
      return false;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Connection`.");
    }
  }
}

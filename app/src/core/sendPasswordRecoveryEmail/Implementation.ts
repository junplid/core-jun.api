import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { SendPasswordRecoveryEmailRepository_I } from "./Repository";
import { hashForLookup } from "../../libs/encryption";

export class SendPasswordRecoveryEmailImplementation implements SendPasswordRecoveryEmailRepository_I {
  constructor(
    private prisma: PrismaClient<
      Prisma.PrismaClientOptions,
      never,
      DefaultArgs
    >,
  ) {}

  async findAccount(props: {
    email: string;
  }): Promise<{ id: number; hash: string } | null> {
    try {
      return await this.prisma.account.findFirst({
        where: { emailHash: hashForLookup(props.email) },
        select: { id: true, hash: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Find Account recover password`.");
    }
  }

  async findHumanService(props: { email: string }): Promise<{
    id: number;
    type: "attendant" | "supervisor";
    hash: string;
  } | null> {
    try {
      // const attendant = await this.prisma.sectorsAttendants.findFirst({
      //   where: { username: props.email },
      //   select: { id: true, hash: true },
      // });
      // if (attendant) {
      //   return { id: attendant.id, type: "attendant", hash: attendant.hash };
      // }

      // const supervisor = await this.prisma.supervisors.findFirst({
      //   where: { username: props.email },
      //   select: { id: true, hash: true },
      // });
      // if (supervisor) {
      //   return { id: supervisor.id, type: "supervisor", hash: supervisor.hash };
      // }
      return null;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Find Account recover password`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { LoginAccountRepository_I } from "./Repository";

export class LoginAccountImplementation implements LoginAccountRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async findAccount(props: {
    email: string;
  }): Promise<
    | {
        password: string;
        id: number;
        type: "adm";
        customerId: string | null;
        hash: string;
      }
    | { password: string; uid: string; type: "subUser" }
    | null
  > {
    try {
      const data = await this.prisma.account.findFirst({
        where: { email: props.email },
        select: { id: true, password: true, hash: true, customerId: true },
      });

      if (!data) {
        const subaccount = await this.prisma.subAccount.findFirst({
          where: { email: props.email, status: true },
          select: { uid: true, password: true },
        });
        return subaccount ? { ...subaccount, type: "subUser" } : null;
      }

      return data ? { ...data, type: "adm" } : null;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Find Account Login`.");
    }
  }
}

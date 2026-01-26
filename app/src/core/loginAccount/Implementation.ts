import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { LoginAccountRepository_I } from "./Repository";
import { hashForLookup } from "../../libs/encryption";

export class LoginAccountImplementation implements LoginAccountRepository_I {
  constructor(
    private prisma: PrismaClient<
      Prisma.PrismaClientOptions,
      never,
      DefaultArgs
    >,
  ) {}

  async findAccount(props: { email: string }): Promise<{
    password: string;
    id: number;
    type: "adm";
    hash: string;
  } | null> {
    try {
      const data = await this.prisma.account.findFirst({
        where: { emailHash: hashForLookup(props.email) },
        select: { id: true, password: true, hash: true },
      });

      return data ? { ...data, type: "adm" } : null;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Find Account Login`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { LoginRootRepository_I } from "./Repository";

export class LoginRootImplementation implements LoginRootRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async find(props: {
    email: string;
  }): Promise<{ password: string; id: number; hash: string } | null> {
    try {
      return await this.prisma.rootUsers.findFirst({
        where: { email: props.email },
        select: { id: true, password: true, hash: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Find Account Login`.");
    }
  }
}

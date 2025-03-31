import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { CreateAuthorizationAccountRepository_I, Props } from "./Repository";

export class CreateAuthorizationAccountImplementation
  implements CreateAuthorizationAccountRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async create(props: Props): Promise<void> {
    try {
      await this.prisma.accountAuthorization.upsert({
        where: { id: props.id, accountId: props.accountId },
        create: { privateKey: props.privateKey, accountId: props.accountId },
        update: { privateKey: props.privateKey },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
  async fetch(props: { accountId: number }): Promise<{ id: number } | null> {
    try {
      const data = await this.prisma.accountAuthorization.findFirst({
        where: props,
        select: { id: true },
      });
      return data;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}

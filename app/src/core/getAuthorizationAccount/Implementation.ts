import { Prisma, PrismaClient } from "@prisma/client";
import { GetAuthorizationAccountRepository_I, Props } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class GetAuthorizationAccountImplementation
  implements GetAuthorizationAccountRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetch(props: Props): Promise<{
    id: number;
    privateKey: string;
  } | null> {
    try {
      return await this.prisma.accountAuthorization.findUnique({
        where: props,
        select: {
          privateKey: true,
          id: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}

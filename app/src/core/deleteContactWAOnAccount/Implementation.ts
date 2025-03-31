import { Prisma, PrismaClient } from "@prisma/client";
import { DeleteContactWAOnAccountRepository_I } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class DeleteContactWAOnAccountOnAccountImplementation
  implements DeleteContactWAOnAccountRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetchExistContactWAOnAccount(props: {
    accountId: number;
    contactWAOnAccountId: number;
  }): Promise<number> {
    try {
      return await this.prisma.contactsWAOnAccount.count({
        where: props,
      });
    } catch (error) {
      throw new Error("Method not implemented.");
    }
  }

  async deleteContactWAOnAccount(where: {
    accountId: number;
    contactWAOnAccountId: number;
  }): Promise<void> {
    try {
      await this.prisma.contactsWAOnAccount.delete({
        where: {
          id: where.contactWAOnAccountId,
          accountId: where.accountId,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Delete Account Asset Data`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { DeleteSubAccountRepository_I, Props } from "./Repository";

export class DeleteSubAccountImplementation
  implements DeleteSubAccountRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async delete({ ...props }: Props): Promise<void> {
    try {
      await this.prisma.subAccount.delete({
        where: {
          id: props.id,
          OR: [
            { accountId: props.accountId },
            { Account: { SubAccount: { some: { id: props.accountId } } } },
          ],
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}

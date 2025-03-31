import { Prisma, PrismaClient } from "@prisma/client";
import {
  DeleteTagOnBusinessRepository_I,
  PropsDelete,
  PropsFetchExist,
} from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class DeleteTagOnBusinessImplementation
  implements DeleteTagOnBusinessRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async delete(data: PropsDelete): Promise<void> {
    try {
      await this.prisma.tagOnBusiness.delete({
        where: { id: data.tagOnBusinessId },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Delete Account Asset Data`.");
    }
  }

  async fetchExist(props: PropsFetchExist): Promise<number> {
    try {
      return await this.prisma.tagOnBusiness.count({
        where: {
          id: props.tagOnBusinessId,
          Business: {
            accountId: props.accountId,
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Plans`.");
    }
  }
}

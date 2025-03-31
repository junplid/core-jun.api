import { Prisma, PrismaClient, TypeVariable } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import {
  GetTagsForSelectHumanServiceRepository_I,
  ResultGet,
} from "./Repository";

export class GetTagsForSelectHumanServiceImplementation
  implements GetTagsForSelectHumanServiceRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async get(props: { userId: number }): Promise<ResultGet[]> {
    try {
      const data = await this.prisma.tagOnBusiness.findMany({
        where: {
          Business: { SectorsAttendants: { some: { id: props.userId } } },
        },
        orderBy: { id: "desc" },
        select: { Tag: { select: { name: true } }, id: true },
      });
      return data.map(({ Tag, id }) => ({ id, name: Tag.name }));
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get variaveis`.");
    }
  }
}

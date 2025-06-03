import { GetTagForSelectDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetTagForSelectUseCase {
  constructor() {}

  async run(dto: GetTagForSelectDTO_I) {
    const tags = await prisma.tag.findMany({
      where: {
        accountId: dto.accountId,
        type: dto.type,
        ...(dto.businessIds?.length && {
          OR: [
            {
              TagOnBusiness: { some: { businessId: { in: dto.businessIds } } },
            },
            { TagOnBusiness: { none: {} } },
          ],
        }),
        ...(dto.name && { name: { contains: dto.name } }),
      },
      orderBy: { id: "desc" },
      select: { name: true, id: true },
    });

    return {
      message: "OK!",
      status: 200,
      tags,
    };
  }
}

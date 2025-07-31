import { GetMenuOnlineItemsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetMenuOnlineItemsUseCase {
  constructor() {}

  async run({ accountId, ...dto }: GetMenuOnlineItemsDTO_I) {
    const items = await prisma.menusOnlineItems.findMany({
      orderBy: { createAt: "desc" },
      where: {
        accountId,
        MenusOnline: { some: { uuid: dto.uuid } },
      },
      select: {
        id: true,
        desc: true,
        name: true,
        afterPrice: true,
        beforePrice: true,
        category: true,
        uuid: true,
        qnt: true,
      },
    });

    return {
      message: "OK!",
      status: 200,
      items,
    };
  }
}

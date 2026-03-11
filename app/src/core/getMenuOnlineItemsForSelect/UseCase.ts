import { GetMenuOnlineItemsForSelectDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetMenuOnlineItemsForSelectUseCase {
  constructor() {}

  async run({ accountId, uuid }: GetMenuOnlineItemsForSelectDTO_I) {
    const items = await prisma.menusOnlineItems.findMany({
      where: { Menu: { uuid }, accountId },
      orderBy: { id: "desc" },
      select: {
        name: true,
        id: true,
        uuid: true,
        img: true,
      },
    });

    return {
      message: "OK!",
      status: 200,
      items,
    };
  }
}

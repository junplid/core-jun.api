import { GetMenuOnlineSubItemsForSelectDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetMenuOnlineSubItemsForSelectUseCase {
  constructor() {}

  async run(dto: GetMenuOnlineSubItemsForSelectDTO_I) {
    const subitems = await prisma.menuOnlineItemSectionSubItems.findMany({
      where: {
        Section: {
          Item: { accountId: dto.accountId, Menu: { uuid: dto.uuid } },
        },
      },
      orderBy: { id: "desc" },
      select: {
        name: true,
        uuid: true,
      },
    });

    const grouped = Object.values(
      subitems.reduce(
        (acc, item) => {
          const name = item.name.toLowerCase().trim();
          if (!acc[name]) {
            acc[name] = {
              name: item.name,
              uuids: [],
            };
          }

          acc[name].uuids.push(item.uuid);

          return acc;
        },
        {} as Record<string, any>,
      ),
    );

    return {
      message: "OK!",
      status: 200,
      subitems: grouped,
    };
  }
}

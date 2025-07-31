import { GetMenusOnlineDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetMenusOnlineUseCase {
  constructor() {}

  async run({ accountId, ...dto }: GetMenusOnlineDTO_I) {
    const menus = await prisma.menusOnline.findMany({
      orderBy: { createAt: "desc" },
      where: { accountId },
      select: { id: true, identifier: true, uuid: true },
    });

    return {
      message: "OK!",
      status: 200,
      menus,
    };
  }
}

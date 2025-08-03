import { GetMenuOnlineDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetMenuOnlineUseCase {
  constructor() {}

  async run({ accountId, ...dto }: GetMenuOnlineDTO_I) {
    const menu = await prisma.menusOnline.findFirst({
      where: dto,
      select: {
        id: true,
        identifier: true,
        uuid: true,
        desc: true,
        bg_primary: true,
        bg_secondary: true,
        bg_tertiary: true,
        logoImg: true,
        status: true,
        titlePage: true,
      },
    });

    if (!menu) {
      throw new ErrorResponse(400).toast({
        title: `Cardápio on-line não foi encontrado.`,
        type: "error",
      });
    }

    const nextMenu = Object.entries(menu).reduce((ac, [key, value]) => {
      if (value !== null) ac[key] = value;
      return ac;
    }, {} as any);

    return { message: "OK!", status: 200, menu: nextMenu };
  }
}

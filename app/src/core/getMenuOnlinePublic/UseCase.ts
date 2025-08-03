import { GetMenuOnlinePublicDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetMenuOnlinePublicUseCase {
  constructor() {}

  async run(dto: GetMenuOnlinePublicDTO_I) {
    const data = await prisma.menusOnline.findFirst({
      where: { identifier: dto.identifier },
      select: {
        uuid: true,
        bg_primary: true,
        bg_secondary: true,
        bg_tertiary: true,
        logoImg: true,
        titlePage: true,
        status: true,
        SizesPizza: {
          select: {
            id: true,
            uuid: true,
            flavors: true,
            price: true,
            slices: true,
            name: true,
          },
        },
        MenusOnlineItems: {
          select: {
            name: true,
            desc: true,
            img: true,
            qnt: true,
            uuid: true,
            afterPrice: true,
            beforePrice: true,
            category: true,
          },
        },
      },
    });

    if (!data) {
      return new ErrorResponse(400).container("Cardápio online não encontrado");
    }

    const { MenusOnlineItems, SizesPizza, ...r } = data;

    return {
      message: "OK!",
      status: 200,
      menu: {
        ...r,
        status: !!r.status,
        items: MenusOnlineItems.map((item) => ({
          ...item,
          afterPrice: item.afterPrice?.toNumber(),
          beforePrice: item.beforePrice?.toNumber(),
        })),
        sizes: SizesPizza.map((size) => ({
          ...size,
          price: size.price.toNumber(),
        })),
      },
    };
  }
}

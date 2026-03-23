import { GetMenuOnlineItemDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetMenuOnlineItemUseCase {
  constructor() {}

  async run({ accountId, ...dto }: GetMenuOnlineItemDTO_I) {
    const item = await prisma.menusOnlineItems.findFirst({
      where: { accountId, Menu: { uuid: dto.uuid }, uuid: dto.itemUuid },
      select: {
        name: true,
        desc: true,
        img: true,
        qnt: true,
        SendToCategory: { select: { uuid: true } },
        afterPrice: true,
        date_validity: true,
        beforePrice: true,
        Categories: {
          select: {
            Category: {
              select: {
                uuid: true,
              },
            },
          },
        },
        Sections: {
          orderBy: { sequence: "asc" },
          select: {
            title: true,
            helpText: true,
            required: true,
            minOptions: true,
            maxOptions: true,
            uuid: true,
            SubItems: {
              orderBy: { sequence: "asc" },
              select: {
                after_additional_price: true,
                before_additional_price: true,
                name: true,
                desc: true,
                image55x55png: true,
                maxLength: true,
                uuid: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      return {
        message: "Nitem não encontrado",
        status: 200,
        item: null,
      };
    }

    const { Categories, Sections, SendToCategory, img, ...rest } = item;
    const itemResolved = {
      fileNameImage: img,
      ...rest,
      send_to_category_uuid: SendToCategory?.uuid || null,
      beforePrice: rest.beforePrice
        ? rest.beforePrice.toString().replace(/\D/g, "")
        : null,
      afterPrice: rest.afterPrice
        ? rest.afterPrice.toString().replace(/\D/g, "")
        : null,
      categoriesUuid: Categories.map((c) => c.Category.uuid),
      sections: Sections.map(({ SubItems, ...section }) => ({
        ...section,
        subItems: SubItems.map(({ image55x55png, ...sub }) => ({
          ...sub,
          after_additional_price: sub.after_additional_price
            ? sub.after_additional_price.toString().replace(/\D/g, "")
            : null,
          before_additional_price: sub.before_additional_price
            ? sub.before_additional_price.toString().replace(/\D/g, "")
            : null,
          previewImage: image55x55png,
        })),
      })),
    };

    return {
      message: "OK!",
      status: 200,
      item: itemResolved,
    };
  }
}

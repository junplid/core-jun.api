import { GetMenuOnlineSectionsOfItemDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetMenuOnlineSectionsOfItemUseCase {
  constructor() {}

  async run(dto: GetMenuOnlineSectionsOfItemDTO_I) {
    const sections = await prisma.menuOnlineItemSections.findMany({
      where: { Item: { uuid: dto.itemUuid, Menu: { uuid: dto.uuid } } },
      orderBy: { sequence: "asc" },
      select: {
        title: true,
        helpText: true,
        maxOptions: true,
        minOptions: true,
        required: true,
        uuid: true,
        SubItems: {
          orderBy: { sequence: "asc" },
          select: {
            uuid: true,
            maxLength: true,
            after_additional_price: true,
            before_additional_price: true,
            desc: true,
            image55x55png: true,
            name: true,
          },
        },
      },
    });

    return {
      message: "OK!",
      status: 200,
      sections: sections.map(({ SubItems, ...section }) => ({
        ...section,
        subItems: SubItems.map(({ image55x55png, ...sub }) => ({
          ...sub,
          after_additional_price: sub.after_additional_price
            ? Number(sub.after_additional_price).toFixed(2)
            : null,
          before_additional_price: sub.before_additional_price
            ? Number(sub.before_additional_price).toFixed(2)
            : null,
          previewImage: image55x55png,
        })),
      })),
    };
  }
}

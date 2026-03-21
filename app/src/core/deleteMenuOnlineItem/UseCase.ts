import { DeleteMenuOnlineItemDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
import { remove } from "fs-extra";
import { resolve } from "path";

const path = resolve(process.env.STORAGE_PATH!, "static", "storage");

export class DeleteMenuOnlineItemUseCase {
  constructor() {}

  async run(dto: DeleteMenuOnlineItemDTO_I) {
    const exist = await prisma.menusOnlineItems.findFirst({
      where: dto,
      select: {
        img: true,
        Sections: { select: { SubItems: { select: { image55x55png: true } } } },
      },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Item não encontrado.`,
        type: "error",
      });
    }

    await prisma.menusOnlineItems.delete({ where: { uuid: dto.uuid } });

    const imgs = [
      exist.img,
      ...exist.Sections.map((s) =>
        s.SubItems.map((i) => i.image55x55png),
      ).flat(),
    ];

    for await (const img of imgs) {
      if (img) {
        await remove(path + img).catch((_err) => {
          console.log("Error ao remover arquivo: ");
        });
      }
    }

    return { message: "OK!", status: 200 };
  }
}

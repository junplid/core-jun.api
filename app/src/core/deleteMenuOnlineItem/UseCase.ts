import { DeleteMenuOnlineItemDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
import { remove } from "fs-extra";

export class DeleteMenuOnlineItemUseCase {
  constructor() {}

  async run(dto: DeleteMenuOnlineItemDTO_I) {
    const exist = await prisma.menusOnlineItems.findFirst({
      where: dto,
      select: { img: true },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Item não encontrado.`,
        type: "error",
      });
    }

    await prisma.menusOnlineItems.delete({ where: { uuid: dto.uuid } });

    let path = "";
    if (process.env.NODE_ENV === "production") {
      path = `../static/storage/${exist.img}`;
    } else {
      path = `../../../static/storage/${exist.img}`;
    }

    await remove(path).catch((_err) => {
      console.log("Error ao remover arquivo: ");
    });

    return { message: "OK!", status: 200 };
  }
}

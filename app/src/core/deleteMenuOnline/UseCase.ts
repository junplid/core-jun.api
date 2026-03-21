import { DeleteMenuOnlineDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
import { remove } from "fs-extra";
import { resolve } from "path";

export class DeleteMenuOnlineUseCase {
  constructor() {}

  async run(dto: DeleteMenuOnlineDTO_I) {
    const exist = await prisma.menusOnline.findFirst({
      where: dto,
      select: { logoImg: true },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Cardápio digital não encontrado.`,
        type: "error",
      });
    }

    await prisma.menusOnline.delete({ where: { uuid: dto.uuid } });
    const path = resolve(
      process.env.STORAGE_PATH!,
      "static",
      "storage",
      exist.logoImg,
    );
    await remove(path).catch((_err) => {
      console.log("Error ao remover arquivo: ");
    });

    return { message: "OK!", status: 200 };
  }
}

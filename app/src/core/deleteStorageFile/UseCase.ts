import { DeleteStorageFileDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
import { remove } from "fs-extra";

export class DeleteStorageFileUseCase {
  constructor() {}

  async run(dto: DeleteStorageFileDTO_I) {
    const exist = await prisma.storagePaths.findFirst({
      where: { id: dto.id, accountId: dto.accountId },
      select: { originalName: true },
    });

    if (!exist) {
      throw new ErrorResponse(400).container(`Arquivo não encontrado`);
    }

    await prisma.storagePaths.delete({ where: { id: dto.id } });

    let path = "";
    if (process.env.NODE_ENV === "production") {
      path = `./static/storage/${exist.originalName}`;
    } else {
      path = `../../../static/storage/${exist.originalName}`;
    }

    await remove(path).catch((_err) => {
      console.log("Error ao remover arquivo: ");
    });

    return { message: "OK!", status: 200 };
  }
}

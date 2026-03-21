import { DeleteStorageFileDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
import { remove } from "fs-extra";
import { resolve } from "path";

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

    const path = resolve(
      process.env.STORAGE_PATH!,
      "static",
      "storage",
      exist.originalName,
    );

    await remove(path).catch((_err) => {
      console.log("Error ao remover arquivo: ");
    });

    return { message: "OK!", status: 200 };
  }
}

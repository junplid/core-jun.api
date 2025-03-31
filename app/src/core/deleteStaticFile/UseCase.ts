import { DeleteStaticFileDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { removeSync } from "fs-extra";
import { resolve } from "path";

export class DeleteStaticFileUseCase {
  constructor() {}

  async run(dto: DeleteStaticFileDTO_I) {
    let oldFile: { name: string; type: string } | null = null;

    if (!dto.attendantAIId) {
      oldFile = await prisma.staticPaths.delete({
        where: dto,
        select: { name: true, type: true },
      });
    } else {
      const fileDel = await prisma.filesOnAttendantOnAI.delete({
        where: { id: dto.id, attendantAIId: dto.attendantAIId },
        select: { filename: true },
      });
      oldFile = { name: fileDel.filename, type: "file" };
    }

    if (oldFile) {
      const path = resolve(
        __dirname,
        `../../../static/${oldFile.type}/${oldFile.name}`
      );
      removeSync(path);
    }

    return { message: "OK!", status: 200 };
  }
}

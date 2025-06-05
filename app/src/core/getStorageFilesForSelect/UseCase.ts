import { GetStorageFilesForSelectDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { format } from "bytes";

export class GetStorageFilesForSelectUseCase {
  constructor() {}

  async run(dto: GetStorageFilesForSelectDTO_I) {
    const files = await prisma.storagePaths.findMany({
      where: { accountId: dto.accountId },
      orderBy: { id: "desc" },
      select: {
        id: true,
        mimetype: true,
        originalName: true,
        StoragePathsOnBusiness: {
          select: { Business: { select: { id: true } } },
        },
      },
    });

    return {
      message: "OK!",
      status: 200,
      files: files.map(({ StoragePathsOnBusiness, ...file }) => ({
        ...file,
        businessIds: StoragePathsOnBusiness.map((s) => s.Business.id),
      })),
    };
  }
}

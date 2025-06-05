import { GetStorageFilesDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { format } from "bytes";

export class GetStorageFilesUseCase {
  constructor() {}

  async run(dto: GetStorageFilesDTO_I) {
    const files = await prisma.storagePaths.findMany({
      where: { accountId: dto.accountId },
      orderBy: { id: "desc" },
      select: {
        id: true,
        mimetype: true,
        size: true,
        originalName: true,
        fileName: true,
        StoragePathsOnBusiness: {
          select: { Business: { select: { id: true, name: true } } },
        },
        createAt: true,
      },
    });

    return {
      message: "OK!",
      status: 200,
      files: files.map(({ StoragePathsOnBusiness, size, ...file }) => ({
        ...file,
        businesses: StoragePathsOnBusiness.map((s) => s.Business),
        size: format(size, { unitSeparator: " ", decimalPlaces: 2 }),
      })),
    };
  }
}

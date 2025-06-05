import { GetStorageFileDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetStorageFileUseCase {
  constructor() {}

  async run(dto: GetStorageFileDTO_I) {
    const file = await prisma.storagePaths.findFirst({
      where: { accountId: dto.accountId, id: dto.id },
      select: {
        originalName: true,
        StoragePathsOnBusiness: {
          select: { Business: { select: { id: true } } },
        },
      },
    });

    if (!file) {
      throw new ErrorResponse(400).container("Arquivo não encontrado!");
    }

    const { StoragePathsOnBusiness, ...rest } = file;

    return {
      message: "OK!",
      status: 200,
      file: {
        ...rest,
        businessIds: StoragePathsOnBusiness.map((b) => b.Business.id),
      },
    };
  }
}

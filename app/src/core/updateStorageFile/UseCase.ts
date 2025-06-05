import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateStorageFileDTO_I } from "./DTO";

export class UpdateStorageFileUseCase {
  constructor() {}

  async run({ accountId, id, businessIds, ...dto }: UpdateStorageFileDTO_I) {
    const file = await prisma.storagePaths.findFirst({
      where: { id, accountId },
      select: { id: true },
    });

    if (!file) {
      throw new ErrorResponse(400).container(`Arquivo não foi encontrado`);
    }

    if (dto.originalName) {
      const fileExists = await prisma.storagePaths.findFirst({
        where: { originalName: dto.originalName, accountId, id: { not: id } },
      });

      if (fileExists) {
        throw new ErrorResponse(400).input({
          text: `Já existe um arquivo com esse nome`,
          path: "originalName",
        });
      }
    }
    const { StoragePathsOnBusiness } = await prisma.storagePaths.update({
      where: { id, accountId },
      data: {
        ...dto,
        ...(businessIds?.length && {
          StoragePathsOnBusiness: {
            deleteMany: {},
            createMany: {
              data: businessIds.map((businessId) => ({ businessId })),
            },
          },
        }),
      },
      select: {
        StoragePathsOnBusiness: {
          select: { Business: { select: { id: true, name: true } } },
        },
      },
    });

    return {
      message: "OK!",
      status: 200,
      file: {
        businesses: StoragePathsOnBusiness.map((item) => item.Business),
      },
    };
  }
}

import { removeSync } from "fs-extra";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateStorageFileDTO_I } from "./DTO";
import { format } from "bytes";
import { resolve } from "path";

const isStorageExceeded = (
  usedBytes: number,
  newFileBytes: number,
  storageLimitInMB: number,
): boolean => {
  const limitBytes = storageLimitInMB * 1024 * 1024;
  return usedBytes + newFileBytes > limitBytes;
};

function removeExt(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx === -1 ? filename : filename.slice(0, idx);
}

export class CreateStorageFileUseCase {
  constructor() {}

  async run({ businessIds, ...dto }: CreateStorageFileDTO_I) {
    try {
      const storage = await prisma.storagePaths.findMany({
        where: { accountId: dto.accountId },
        select: { size: true },
      });

      const usedBytes = storage.reduce((ac, cr) => ac + cr.size, 0);

      if (isStorageExceeded(usedBytes, dto.size, 13)) {
        const path = resolve(
          process.env.STORAGE_PATH!,
          "static",
          "storage",
          dto.originalName,
        );

        removeSync(path);

        throw new ErrorResponse(400).container(
          "Limite de armazenamento atingido.",
        );
      }

      const { StoragePathsOnBusiness, ...file } =
        await prisma.storagePaths.create({
          data: {
            ...dto,
            originalName: removeExt(dto.originalName),
            ...(businessIds?.length && {
              StoragePathsOnBusiness: {
                createMany: {
                  data: businessIds.map((businessId) => ({ businessId })),
                },
              },
            }),
          },
          select: {
            id: true,
            mimetype: true,
            createAt: true,
            StoragePathsOnBusiness: {
              select: { Business: { select: { id: true, name: true } } },
            },
          },
        });

      return {
        message: "OK!",
        status: 201,
        file: {
          ...file,
          originalName: removeExt(dto.originalName),
          size: format(dto.size, { decimalPlaces: 2 }),
          businesses: StoragePathsOnBusiness.map((s) => s.Business),
          fileName: dto.fileName,
        },
      };
    } catch (error) {
      console.error("Error creating storage file:", error);
      const path = resolve(
        process.env.STORAGE_PATH!,
        "static",
        "storage",
        dto.originalName,
      );

      removeSync(path);
      throw new ErrorResponse(400).container(
        "Falha no upload. Por favor tente novamente mais tarde",
      );
    }
  }
}

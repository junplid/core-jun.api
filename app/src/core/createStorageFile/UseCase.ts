import { prisma } from "../../adapters/Prisma/client";
import { CreateStorageFileDTO_I } from "./DTO";
import { format } from "bytes";

// const isStorageExceeded = (
//   fileSizeInBytes: number,
//   storageLimitInGB: number
// ): boolean => {
//   const storageLimitInBytes = storageLimitInGB * 1024 ** 3;
//   return fileSizeInBytes > storageLimitInBytes;
// };

function removeExt(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx === -1 ? filename : filename.slice(0, idx);
}

export class CreateStorageFileUseCase {
  constructor() {}

  async run({ businessIds, ...dto }: CreateStorageFileDTO_I) {
    try {
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
      throw new Error("Failed to create storage file. Please try again later.");
    }
  }
}

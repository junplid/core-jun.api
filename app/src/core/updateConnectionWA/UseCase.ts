import { UpdateConnectionWADTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
import { resolve } from "path";
import { remove } from "fs-extra";

export class UpdateConnectionWAUseCase {
  constructor() {}

  async run({ accountId, id, ...dto }: UpdateConnectionWADTO_I) {
    const exist = await prisma.connectionWA.count({
      where: {
        id,
        Business: { accountId },
        type: dto.type,
      },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Conexão WA não encontrada`,
        type: "error",
      });
    }

    try {
      const { name, businessId, type, description, fileNameImage, ...config } =
        dto;

      await prisma.connectionWA.update({
        where: {
          id,
          Business: { accountId },
        },
        data: { name, businessId, type, description },
        select: { Business: { select: { name: true } } },
      });

      const hasConfig = !!(Object.keys(config).length || fileNameImage);

      if (hasConfig) {
        await prisma.connectionConfig.update({
          where: {
            connectionWAId: id,
            ConnectionWA: { Business: { accountId } },
          },
          data: config,
        });
      }

      return { message: "OK!", status: 200 };
    } catch (error) {
      if (dto.fileNameImage) {
        const path = resolve(
          __dirname,
          "../../../",
          "static",
          "image",
          dto.fileNameImage
        );
        await remove(path).catch((error) => {
          console.log("Não foi possivel deletar a imagem antiga", error);
        });
      }
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar conexão WA`,
        type: "error",
      });
    }
  }
}

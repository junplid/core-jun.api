import { UpdateMenuOnlineDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
import { remove } from "fs-extra";

let path = "";
if (process.env.NODE_ENV === "production") {
  path = `../static/storage`;
} else {
  path = `../../../static/storage`;
}

export class UpdateMenuOnlineUseCase {
  constructor() {}

  async run({ accountId, id, fileNameImage, ...dto }: UpdateMenuOnlineDTO_I) {
    const getAccount = await prisma.account.findFirst({
      where: { id: accountId },
      select: { isPremium: true },
    });
    if (!getAccount) throw new ErrorResponse(400).container("Não autorizado.");

    if (!getAccount.isPremium) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Cardápios on-line exclusivos para usuários Premium.",
      });
    }

    const exist = await prisma.menusOnline.findFirst({
      where: { id, accountId },
      select: { logoImg: true, uuid: true },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Cardápio on-line não encontrado.`,
        type: "error",
      });
    }

    if (dto.identifier) {
      const existIdentifier = await prisma.menusOnline.findFirst({
        where: { identifier: dto.identifier },
        select: { id: true },
      });

      if (existIdentifier) {
        throw new ErrorResponse(400).input({
          text: `Já existe um cardápio com esse identificador.`,
          path: "identifier",
        });
      }
    }

    try {
      await prisma.menusOnline.update({
        where: { id },
        data: { ...(fileNameImage && { logoImg: fileNameImage }), ...dto },
      });

      if (fileNameImage && exist.logoImg) {
        await remove(path + `/${exist.logoImg}`).catch((_err) => {
          console.log("Error ao remover arquivo: ");
        });
      }

      return {
        message: "OK!",
        status: 200,
        menu: { logoImg: fileNameImage, uuid: exist.uuid },
      };
    } catch (error) {
      console.log(error);
      if (fileNameImage) {
        await remove(path + `/${fileNameImage}`).catch((_err) => {
          console.log("Error ao remover arquivo: ");
        });
      }
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar Cardápio on-line`,
        type: "error",
      });
    }
  }
}

import { UpdateMenuOnlineDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
import { remove } from "fs-extra";
import { resolve } from "path";

const path = resolve(process.env.STORAGE_PATH!, "static", "storage");

export class UpdateMenuOnlineUseCase {
  constructor() {}

  async run({
    accountId,
    id,
    fileNameImage,
    fileNameCapaImage,
    ...dto
  }: UpdateMenuOnlineDTO_I) {
    // const getAccount = await prisma.account.findFirst({
    //   where: { id: accountId },
    //   select: { isPremium: true },
    // });
    // if (!getAccount) throw new ErrorResponse(400).container("Não autorizado.");

    // if (!getAccount.isPremium) {
    //   throw new ErrorResponse(400).input({
    //     path: "name",
    //     text: "Cardápios on-line exclusivos para usuários Premium.",
    //   });
    // }

    const exist = await prisma.menusOnline.findFirst({
      where: { id, accountId },
      select: { logoImg: true, uuid: true, capaImg: true },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Cardápio digital não encontrado.`,
        type: "error",
      });
    }

    if (dto.identifier) {
      const existIdentifier = await prisma.menusOnline.findFirst({
        where: { identifier: dto.identifier, id: { not: id } },
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
        data: {
          ...(fileNameImage && { logoImg: fileNameImage }),
          ...(fileNameCapaImage && { capaImg: fileNameCapaImage }),
          ...dto,
        },
      });

      if (fileNameImage && exist.logoImg) {
        await remove(path + `/${exist.logoImg}`).catch((_err) => {
          console.log("Error ao remover arquivo: ");
        });
      }

      if (fileNameCapaImage && exist.capaImg) {
        await remove(path + `/${exist.capaImg}`).catch((_err) => {
          console.log("Error ao remover arquivo: ");
        });
      }

      return {
        message: "OK!",
        status: 200,
        menu: {
          logoImg: fileNameImage,
          capaImg: fileNameCapaImage,
          uuid: exist.uuid,
        },
      };
    } catch (error) {
      console.log(error);
      if (fileNameImage) {
        await remove(path + `/${fileNameImage}`).catch((_err) => {
          console.log("Error ao remover arquivo: ");
        });
      }
      if (fileNameCapaImage) {
        await remove(path + `/${fileNameCapaImage}`).catch((_err) => {
          console.log("Error ao remover arquivo: ");
        });
      }
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar Cardápio digital`,
        type: "error",
      });
    }
  }
}

import { remove } from "fs-extra";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateMenuOnlineDTO_I } from "./DTO";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";

export class CreateMenuOnlineUseCase {
  constructor() {}

  async run({ fileNameImage, ...dto }: CreateMenuOnlineDTO_I) {
    // const getAccount = await prisma.account.findFirst({
    //   where: { id: dto.accountId },
    //   select: { isPremium: true },
    // });
    // if (!getAccount) throw new ErrorResponse(400).container("Não autorizado.");

    // const countResource = await prisma.menusOnline.count({
    //   where: { accountId: dto.accountId },
    // });

    // if (!getAccount.isPremium) {
    //   throw new ErrorResponse(400).input({
    //     path: "name",
    //     text: "Cardápios on-line exclusivos para usuários Premium.",
    //   });
    // }

    // if (!getAccount.isPremium && countResource >= 1) {
    //   throw new ErrorResponse(400).input({
    //     path: "name",
    //     text: "Limite de cardápios on-line atingido.",
    //   });
    // }

    const exist = await prisma.menusOnline.findFirst({
      where: {
        accountId: dto.accountId,
        identifier: dto.identifier,
      },
      select: { id: true },
    });

    if (exist) {
      throw new ErrorResponse(400).input({
        text: "Já existe um cardápio com esse identificador.",
        path: "identifier",
      });
    }

    if (!cacheConnectionsWAOnline.get(dto.connectionWAId)) {
      throw new ErrorResponse(400).input({
        text: "Selecione uma conexão WA ativa.",
        path: "connectionWAId",
      });
    }

    try {
      const menu = await prisma.menusOnline.create({
        data: { ...dto, logoImg: fileNameImage },
        select: { id: true, createAt: true, uuid: true },
      });

      return {
        message: "Cardápio criado com sucesso.",
        status: 201,
        menu,
      };
    } catch (error) {
      let path = "";
      if (process.env.NODE_ENV === "production") {
        path = `../static/storage/${fileNameImage}`;
      } else {
        path = `../../../static/storage/${fileNameImage}`;
      }
      await remove(path).catch((_err) => {
        console.log("Error ao remover arquivo: ");
      });
      throw new ErrorResponse(400).container(
        "Error ao tentar criar cardápio on-line.",
      );
    }
  }
}

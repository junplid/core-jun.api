import { remove } from "fs-extra";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateMenuOnlineItemDTO_I } from "./DTO";

export class CreateMenuOnlineItemUseCase {
  constructor() {}

  async run({ fileNameImage, ...dto }: CreateMenuOnlineItemDTO_I) {
    const getAccount = await prisma.account.findFirst({
      where: { id: dto.accountId },
      select: { isPremium: true },
    });
    if (!getAccount) throw new ErrorResponse(40).container("Não autorizado.");
    if (!getAccount.isPremium) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Cardápios on-line exclusivos para usuários Premium.",
      });
    }

    const menu = await prisma.menusOnline.findFirst({
      where: { accountId: dto.accountId, uuid: dto.uuid },
      select: { id: true },
    });

    if (!menu) {
      throw new ErrorResponse(400).input({
        text: "Cardápio não encontrado.",
        path: "uuid",
      });
    }

    try {
      const item = await prisma.menusOnlineItems.create({
        data: {
          ...dto,
          img: fileNameImage,
          MenusOnline: { connect: { id: menu.id } },
        },
        select: { id: true, createAt: true, uuid: true },
      });

      return {
        message: "Item criado com sucesso.",
        status: 201,
        item,
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
      throw new ErrorResponse(40).container(
        "Error ao tentar criar cardápio on-line."
      );
    }
  }
}

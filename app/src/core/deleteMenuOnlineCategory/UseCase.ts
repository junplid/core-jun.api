import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { DeleteMenuOnlineCategoryDTO_I } from "./DTO";

export class DeleteMenuOnlineCategoryUseCase {
  constructor() {}

  async run({ uuid, accountId, categoryUuid }: DeleteMenuOnlineCategoryDTO_I) {
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

    const menu = await prisma.menusOnline.findFirst({
      where: { accountId, uuid },
      select: { id: true },
    });

    if (!menu) {
      throw new ErrorResponse(400).input({
        text: "Cardápio não encontrado.",
        path: "uuid",
      });
    }

    const category = await prisma.menuOnlineCategory.findFirst({
      where: { menuId: menu.id, uuid: categoryUuid },
      select: { id: true },
    });

    if (!category) {
      throw new ErrorResponse(400).input({
        text: "Categoria não encontrada.",
        path: "root",
      });
    }

    try {
      await prisma.menuOnlineCategory.delete({ where: { id: category.id } });

      return {
        message: "Categoria deletada com sucesso.",
        status: 201,
        category,
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).container("Error ao tentar criar tamanho.");
    }
  }
}

import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateMenuOnlineCategorySequenceDTO_I } from "./DTO";

export class UpdateMenuOnlineCategorySequenceUseCase {
  constructor() {}

  async run({ uuid, accountId, items }: UpdateMenuOnlineCategorySequenceDTO_I) {
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

    try {
      await prisma.$transaction(async (ctx) => {
        for (let sequence = 0; sequence < items.length; sequence++) {
          const catUuid = items[sequence];

          const category = await ctx.menuOnlineCategory.findFirst({
            where: { menuId: menu.id, uuid: catUuid },
            select: { id: true },
          });
          if (!category) {
            throw new ErrorResponse(400).input({
              text: "Categoria não encontrada.",
              path: "root",
            });
          }
          await ctx.menuOnlineCategory.update({
            where: { id: category.id },
            data: { sequence },
          });
        }
      });

      return {
        message: "Sequencia das categorias atualizada com sucesso.",
        status: 201,
      };
    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw new ErrorResponse(400).container(
        "Error ao tentar atualizar sequencia das categorias.",
      );
    }
  }
}

import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateMenuOnlineSizePizzaDTO_I } from "./DTO";

export class CreateMenuOnlineSizePizzaUseCase {
  constructor() {}

  async run({ uuid, accountId, ...dto }: CreateMenuOnlineSizePizzaDTO_I) {
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
      const size = await prisma.sizesPizza.create({
        data: {
          ...dto,
          menuId: menu.id,
        },
        select: { id: true, createAt: true },
      });

      return {
        message: "Tamanho criado com sucesso.",
        status: 201,
        size,
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).container("Error ao tentar criar tamanho.");
    }
  }
}

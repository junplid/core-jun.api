import { UpdateMenuOnlineInfoDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";

export class UpdateMenuOnlineInfoUseCase {
  constructor() {}

  async run({ accountId, uuid, ...dto }: UpdateMenuOnlineInfoDTO_I) {
    const exist = await prisma.menusOnline.findFirst({
      where: { uuid, accountId },
      select: { logoImg: true, id: true },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Cardápio digital não encontrado.`,
        type: "error",
      });
    }

    try {
      await prisma.menuInfo.upsert({
        where: { menuId: exist.id },
        create: { ...dto, menuId: exist.id },
        update: dto,
      });

      return {
        message: "OK!",
        status: 200,
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar informações do Cardápio digital`,
        type: "error",
      });
    }
  }
}

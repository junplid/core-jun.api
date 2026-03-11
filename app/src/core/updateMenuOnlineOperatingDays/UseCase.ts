import { UpdateMenuOnlineOperatingDaysDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";

export class UpdateMenuOnlineOperatingDaysUseCase {
  constructor() {}

  async run({ accountId, uuid, ...dto }: UpdateMenuOnlineOperatingDaysDTO_I) {
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
      await prisma.menuOnlineOperatingDays.deleteMany({
        where: { menuId: exist.id },
      });
      await prisma.menuOnlineOperatingDays.createMany({
        data: dto.days.map((d) => ({ ...d, menuId: exist.id })),
      });
      return {
        message: "OK!",
        status: 200,
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar dias de operação.`,
        type: "error",
      });
    }
  }
}

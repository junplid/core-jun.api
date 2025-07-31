import { GetMenuOnlineDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetMenuOnlineUseCase {
  constructor() {}

  async run({ accountId, ...dto }: GetMenuOnlineDTO_I) {
    const menu = await prisma.menusOnline.findFirst({
      where: dto,
      select: { id: true, identifier: true, uuid: true, desc: true },
    });

    if (!menu) {
      throw new ErrorResponse(400).toast({
        title: `Cardápio on-nline não foi encontrado.`,
        type: "error",
      });
    }

    return { message: "OK!", status: 200, menu };
  }
}

import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateMenuOnlineSubItemsStatusDTO_I } from "./DTO";

export class UpdateMenuOnlineSubItemsStatusUseCase {
  constructor() {}

  async run(dto: UpdateMenuOnlineSubItemsStatusDTO_I) {
    try {
      const items = dto.subItemsUuid.map((s) => s.split("_")).flat();
      await prisma.menuOnlineItemSectionSubItems.updateMany({
        where: { uuid: { in: items } },
        data: { status: dto.action === "true" },
      });

      return { message: "OK.", status: 201 };
    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw new ErrorResponse(400).input({
        text: "Error ao tentar atualizar opções.",
        path: "root",
      });
    }
  }
}

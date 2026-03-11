import { GetMenuOnlineCategoriesDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetMenuOnlineCategoriesUseCase {
  constructor() {}

  async run(dto: GetMenuOnlineCategoriesDTO_I) {
    const category = await prisma.menuOnlineCategory.findFirst({
      where: {
        uuid: dto.catUuid,
        Menu: { uuid: dto.uuid },
      },
      orderBy: { id: "desc" },
      select: {
        name: true,
        image45x45png: true,
        days_in_the_week: true,
        endAt: true,
        startAt: true,
      },
    });

    if (!category) {
      throw new ErrorResponse(404).container("Categoria nao encontrada");
    }

    return {
      message: "OK!",
      status: 200,
      category: category,
    };
  }
}

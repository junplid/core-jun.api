import { GetTemplatesDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetTemplatesUseCase {
  constructor() {}

  async run(dto: GetTemplatesDTO_I) {
    const data = await prisma.templates.findMany({
      orderBy: { count_usage: "desc" },
      select: {
        id: true,
        title: true,
        card_desc: true,
        chat_demo: true,
        created_by: true,
      },
      take: dto.limit,
    });

    return {
      message: "OK!",
      status: 200,
      templates: data,
    };
  }
}

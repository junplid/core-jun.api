import { GetTemplate_root_DTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetTemplate_root_UseCase {
  constructor() {}

  async run(dto: GetTemplate_root_DTO_I) {
    try {
      const template = await prisma.templates.findFirstOrThrow({
        where: { id: dto.id },
        select: {
          card_desc: true,
          chat_demo: true,
          markdown_desc: true,
          script_runner: true,
          title: true,
          Sections: {
            select: {
              collapsible: true,
              desc: true,
              inputs: true,
              name: true,
              title: true,
            },
          },
        },
      });
      const { Sections, ...rest } = template;
      return {
        message: "OK",
        status: 200,
        template: {
          ...rest,
          sections: Sections,
          chat_demo: JSON.stringify(rest.chat_demo),
        },
      };
    } catch (error) {
      throw new ErrorResponse(404);
    }
  }
}

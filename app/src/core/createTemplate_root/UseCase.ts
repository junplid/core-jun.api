import { CreateTemplate_root_DTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { nanoid } from "nanoid";

export class CreateTemplate_root_UseCase {
  constructor() {}

  async run({ sections, ...dto }: CreateTemplate_root_DTO_I) {
    try {
      let safeValue: any = null;

      try {
        safeValue = JSON.parse(dto.chat_demo || "null");
      } catch {
        safeValue = null;
      }

      if (safeValue === null) {
        throw new ErrorResponse(400).input({
          path: "chat_demo",
          text: "JSON invalido",
        });
      }

      const templater = await prisma.$transaction(async (tx) => {
        const template = await tx.templates.create({
          data: {
            type: dto.type,
            title: dto.title,
            card_desc: dto.card_desc,
            markdown_desc: dto.markdown_desc,
            script_runner: dto.script_runner,
            chat_demo: safeValue,
            created_by: "@junplid",
          },
          select: { id: true },
        });

        const sectionPromises = sections.map((section, index) => {
          return tx.templateInputsSection.create({
            data: {
              templateId: template.id,
              hash: `tpl-sec_${nanoid()}_${index}`,
              sequence: index,
              ...section,
            },
          });
        });

        await Promise.all(sectionPromises);

        return template;
      });

      return { status: 201, template: templater };
    } catch (error) {
      throw new ErrorResponse(400).input({
        path: "root",
        text: JSON.stringify(error),
      });
    }
  }
}

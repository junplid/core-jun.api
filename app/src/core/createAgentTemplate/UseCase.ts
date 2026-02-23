import { CreateAgentTemplateDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { nanoid } from "nanoid";

export class CreateAgentTemplateUseCase {
  constructor() {}

  async run({ sections, ...dto }: CreateAgentTemplateDTO_I) {
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
        const template = await tx.agentTemplates.create({
          data: {
            title: dto.title,
            card_desc: dto.card_desc,
            markdown_desc: dto.markdown_desc,
            config_flow: dto.config_flow,
            script_runner: dto.script_runner,
            script_build_agentai_for_test: dto.script_build_agentai_for_test,
            chat_demo: safeValue,
            variables: dto.variables || [],
            tags: dto.tags || [],
            created_by: "@junplid",
          },
          select: { id: true },
        });

        const sectionPromises = sections.map((section, index) => {
          return tx.agentTemplateInputsSection.create({
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

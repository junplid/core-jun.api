import { UpdateTemplate_root_DTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { nanoid } from "nanoid";

export class UpdateTemplate_root_UseCase {
  constructor() {}

  async run({ sections, id, chat_demo, ...dto }: UpdateTemplate_root_DTO_I) {
    try {
      const find = await prisma.templates.findFirst({
        where: { id },
        select: { id: true },
      });
      if (!find) throw new ErrorResponse(404);

      let safeValue: any | undefined = undefined;

      if (chat_demo) {
        try {
          safeValue = JSON.parse(chat_demo || "null");
        } catch {
          safeValue = null;
        }

        if (safeValue === null) {
          throw new ErrorResponse(400).input({
            path: "chat_demo",
            text: "JSON invalido",
          });
        }
      }

      if (sections?.length) {
        await prisma.templateInputsSection.deleteMany({
          where: { templateId: id },
        });
        await prisma.templateInputsSection.createMany({
          data: sections.map((se, index) => ({
            ...se,
            templateId: id,
            hash: `tpl-sec_${nanoid()}_${index}`,
            sequence: index,
          })),
        });
      }

      const rest = { ...dto, chat_demo: safeValue };
      const isValue = Object.values(rest).some((s) => s !== undefined);

      if (isValue) {
        await prisma.templates.update({
          where: { id },
          data: rest,
        });
      }

      return { status: 200 };
    } catch (error) {
      throw new ErrorResponse(400).input({
        path: "root",
        text: JSON.stringify(error),
      });
    }
  }
}

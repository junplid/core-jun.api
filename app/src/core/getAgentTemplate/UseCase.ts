import { GetAgentTemplateDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

function parseFields(input: string) {
  const result = [];
  let buffer = "";
  let depth = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === "{") {
      depth++;
      buffer += char;
      continue;
    }

    if (char === "}") {
      depth--;
      buffer += char;
      continue;
    }

    // Só divide na vírgula se estiver no nível raiz
    if (char === "," && depth === 0) {
      result.push(buffer.trim());
      buffer = "";
      continue;
    }

    buffer += char;
  }

  if (buffer.trim()) {
    result.push(buffer.trim());
  }

  return result;
}

export class GetAgentTemplateUseCase {
  constructor() {}

  async run(dto: GetAgentTemplateDTO_I) {
    try {
      const items_root = parseFields(dto.fields);

      const fields_root = items_root?.reduce<Record<string, boolean>>(
        (prev, curr) => {
          if (!curr.includes("{")) prev[curr] = true;
          return prev;
        },
        {},
      );

      const items_Sections = items_root
        .find((s) => s.startsWith("Sections"))
        ?.replace(/^Sections{(.+)}/, "$1");

      let sectionsFields: null | Record<string, boolean> = null;

      if (items_Sections) {
        const items_section = parseFields(items_Sections.replace(/^{/, ""));
        const fields_root = items_section?.reduce<Record<string, boolean>>(
          (prev, curr) => {
            if (!curr.includes("{")) prev[curr] = true;
            return prev;
          },
          {},
        );
        sectionsFields = fields_root;
      }

      const template = await prisma.agentTemplates.findFirst({
        where: { id: dto.id },
        select: {
          ...fields_root,
          ...(sectionsFields && { Sections: { select: sectionsFields } }),
        },
      });

      return {
        message: "OK!",
        status: 200,
        template,
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).input({
        path: "fields",
        text: "Campos incorreto! Use: title,created_by,markdown_desc,createAt,updateAt,Sections{name,title,collapsible,id,hash,desc,inputs,sequence}",
      });
    }
  }
}

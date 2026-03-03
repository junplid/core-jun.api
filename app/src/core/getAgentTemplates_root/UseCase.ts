import { GetAgentTemplates_root_DTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetAgentTemplates_root_UseCase {
  constructor() {}

  async run(_dto: GetAgentTemplates_root_DTO_I) {
    const templates = await prisma.agentTemplates.findMany({
      select: {
        title: true,
        card_desc: true,
        id: true,
        count_usage: true,
        createAt: true,
      },
    });
    return { message: "OK", status: 200, templates };
  }
}

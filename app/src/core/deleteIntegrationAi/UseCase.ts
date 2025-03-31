import { DeleteIntegrationAiDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class DeleteIntegrationAiUseCase {
  constructor() {}

  async run(dto: DeleteIntegrationAiDTO_I) {
    await prisma.artificialIntelligence.delete({ where: dto });
    return { message: "OK!", status: 200 };
  }
}

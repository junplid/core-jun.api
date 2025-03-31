import { DeleteAtendantAiDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class DeleteAtendantAiUseCase {
  constructor() {}

  async run(dto: DeleteAtendantAiDTO_I) {
    await prisma.attendantOnAI.delete({ where: dto });
    return { message: "OK!", status: 200 };
  }
}

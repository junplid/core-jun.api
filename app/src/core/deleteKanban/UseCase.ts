import { DeleteKanbanDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class DeleteKanbanUseCase {
  constructor() {}

  async run(dto: DeleteKanbanDTO_I) {
    await prisma.funnelKanban.delete({ where: dto });
    return { message: "OK!", status: 200 };
  }
}

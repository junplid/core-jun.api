import { GetFunnelKanbanADMDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { sort } from "fast-sort";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetFunnelKanbanADMUseCase {
  constructor() {}

  async run(dto: GetFunnelKanbanADMDTO_I) {
    const kanban = await prisma.funnelKanban.findFirst({
      where: dto,
      select: {
        name: true,
        Business: { select: { id: true } },
        StepsFunnelKanban: {
          select: { color: true, name: true, sequence: true, id: true },
        },
      },
    });

    if (!kanban) {
      throw new ErrorResponse(400).toast({
        title: `Kanban não foi encontrado`,
        type: "error",
      });
    }
    const { StepsFunnelKanban, Business, name } = kanban;

    const columns = sort(StepsFunnelKanban).asc((col) => col.sequence);

    return {
      message: "OK!",
      status: 200,
      kanban: { name, businessId: Business.id, columns },
    };
  }
}

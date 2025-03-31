import { socketIo } from "../../infra/express";
import { UpdateFunnelKanbanTicketDTO_I } from "./DTO";
import { UpdateFunnelKanbanTicketRepository_I } from "./Repository";

export class UpdateFunnelKanbanTicketUseCase {
  constructor(private repository: UpdateFunnelKanbanTicketRepository_I) {}

  async run(dto: UpdateFunnelKanbanTicketDTO_I) {
    if (dto.columns.length === 2) {
      if (dto.columns[0].rows.some((row) => row.delete)) {
        dto.columns[0].rows.forEach(async (row) => {
          if (row.delete) {
            await this.repository.deleteColumn({
              userId: dto.userId,
              funnelId: dto.kanbanId,
              columnId: dto.columns[1].id,
              ticketId: row.ticketId,
            });
            await this.repository.createTicketInColumn({
              sequence: row.newSequence,
              columnId: dto.columns[0].id,
              ticketId: row.ticketId,
            });
            return;
          }
          await this.repository.updateColumn({
            userId: dto.userId,
            funnelId: dto.kanbanId,
            columnId: dto.columns[0].id,
            rows: row,
          });
        });
      }
      if (dto.columns[1].rows.some((row) => row.delete)) {
        dto.columns[1].rows.forEach(async (row) => {
          if (row.delete) {
            await this.repository.deleteColumn({
              userId: dto.userId,
              funnelId: dto.kanbanId,
              columnId: dto.columns[0].id,
              ticketId: row.ticketId,
            });
            await this.repository.createTicketInColumn({
              columnId: dto.columns[1].id,
              ticketId: row.ticketId,
              sequence: row.newSequence,
            });
            return;
          }
          await this.repository.updateColumn({
            userId: dto.userId,
            funnelId: dto.kanbanId,
            columnId: dto.columns[1].id,
            rows: row,
          });
        });
      }
    }
    if (dto.columns.length === 1) {
      dto.columns[0].rows.forEach(async (row) => {
        await this.repository.updateColumn({
          userId: dto.userId,
          funnelId: dto.kanbanId,
          columnId: dto.columns[0].id,
          rows: row,
        });
      });
    }

    const fetchUser = await this.repository.fetchUser({
      userId: dto.userId,
    });
    if (fetchUser) {
      socketIo
        .of(`/business-${fetchUser.businessId}/human-service`)
        .emit("update-kanban", {
          kanbanId: dto.kanbanId,
          columns: dto.columns,
          userId: dto.userId,
        });
    }

    return {
      message: "OK!",
      status: 200,
    };
  }
}

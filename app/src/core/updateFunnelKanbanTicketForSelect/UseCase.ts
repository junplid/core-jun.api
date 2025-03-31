import { socketIo } from "../../infra/express";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateFunnelKanbanTicketForSelectDTO_I } from "./DTO";
import { UpdateFunnelKanbanTicketForSelectRepository_I } from "./Repository";

export class UpdateFunnelKanbanTicketForSelectUseCase {
  constructor(
    private repository: UpdateFunnelKanbanTicketForSelectRepository_I
  ) {}

  async run(dto: UpdateFunnelKanbanTicketForSelectDTO_I) {
    const ticketAlreadyExists = await this.repository.fetchTicketExist({
      ticketId: dto.ticketId,
    });
    if (!ticketAlreadyExists) {
      throw new ErrorResponse(400)
        .toast({
          title: `Ticket não foi encontrado`,
          type: "error",
        })
        .input({
          text: "Ticket não foi encontrado",
          path: "ticketId",
        });
    }
    const ticketOnKanban = await this.repository.fetchTicket({
      ticketId: dto.ticketId,
    });
    if (!ticketOnKanban) {
      await this.repository.createTicketInColumn({
        ticketId: dto.ticketId,
        columnId: dto.columnId,
        sequence: 1,
      });
      const fetchUser = await this.repository.fetchUser({
        userId: dto.userId,
      });
      if (fetchUser) {
        socketIo
          .of(`/business-${fetchUser.businessId}/human-service`)
          .emit("update-kanban-options", {
            newColumnId: dto.columnId,
            ticketId: dto.ticketId,
            sequence: 1,
          });
      }
    } else {
      await this.repository.deleteColumn({
        userId: dto.userId,
        columnId: dto.columnId,
        ticketId: dto.ticketId,
      });
      await this.repository.createTicketInColumn({
        ticketId: dto.ticketId,
        columnId: dto.columnId,
        sequence: ticketOnKanban.sequence,
      });
      const fetchUser = await this.repository.fetchUser({
        userId: dto.userId,
      });
      if (fetchUser) {
        socketIo
          .of(`/business-${fetchUser.businessId}/human-service`)
          .emit("update-kanban-options", {
            newColumnId: dto.columnId,
            ticketId: dto.ticketId,
            sequence: ticketOnKanban.sequence,
            oldColumnId: ticketOnKanban.oldColumnId,
          });
      }
    }

    return {
      message: "OK!",
      status: 200,
    };
  }
}

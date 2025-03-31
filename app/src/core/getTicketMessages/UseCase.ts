import { socketIo } from "../../infra/express";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetTicketMessagesDTO_I } from "./DTO";
import { GetTicketMessagesRepository_I } from "./Repository";

export class GetTicketMessagesUseCase {
  constructor(private repository: GetTicketMessagesRepository_I) {}

  async run(dto: GetTicketMessagesDTO_I) {
    const isAttendant = await this.repository.fetchAttendantOfTicket(
      dto.userId,
      dto.id
    );

    if (!isAttendant) {
      throw new ErrorResponse(400).toast({
        title: `Ticket não foi encontrado ou não pertence ao atendente`,
        type: "error",
      });
    }

    const conversation = await this.repository.fetchMessagesOfTicket(
      dto.userId,
      dto.id,
      !!dto.isRead
    );

    if (!conversation) {
      throw new ErrorResponse(400).toast({
        title: `Ticket não foi encontrado ou não pertence ao atendente`,
        type: "error",
      });
    }

    if (dto.isRead) {
      socketIo
        .of(`/business-${conversation.businessId}/human-service`)
        .emit("reset-msg-unread-ticket", {
          ticketId: dto.id,
        });
    }

    return {
      message: "OK!",
      status: 200,
      conversation: conversation.conversation,
    };
  }
}

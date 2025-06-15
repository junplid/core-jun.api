import { SendMessageText } from "../../adapters/Baileys/modules/sendMessage";
import { prisma } from "../../adapters/Prisma/client";
import { socketIo } from "../../infra/express";
import { cacheAccountSocket } from "../../infra/websocket/cache";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { SendTicketMessageDTO_I } from "./DTO";

export class SendTicketMessageUseCase {
  constructor() {}

  async run({ ...dto }: SendTicketMessageDTO_I) {
    const exist = await prisma.tickets.findFirst({
      where: {
        id: dto.id,
        ...(dto.accountId && { accountId: dto.accountId }),
        status: "OPEN",
      },
      select: {
        connectionWAId: true,
        InboxDepartment: { select: { name: true, id: true, businessId: true } },
        ContactsWAOnAccount: {
          select: {
            name: true,
            ContactsWA: { select: { completeNumber: true } },
          },
        },
        updateAt: true,
      },
    });

    if (!exist) {
      throw new ErrorResponse(400).container(
        "Não foi possivel encontrar o ticket."
      );
    }

    const { InboxDepartment, ContactsWAOnAccount, updateAt } = exist;
    let messageId = 0;
    let lastInteractionDate: null | Date = null;
    if (dto.type === "text") {
      try {
        const msg = await SendMessageText({
          connectionId: exist.connectionWAId,
          text: dto.text,
          toNumber:
            ContactsWAOnAccount.ContactsWA.completeNumber + "@s.whatsapp.net",
        });
        if (!msg?.key?.id) {
          throw new ErrorResponse(500).toast({
            title: "Erro ao enviar mensagem.",
            description: "Não foi possível enviar a mensagem.",
            type: "error",
          });
        }
        const { id: msgId, createAt } = await prisma.ticketMessage.create({
          data: {
            by: "user",
            type: "text",
            message: dto.text,
            ticketsId: dto.id,
            messageKey: msg.key.id,
          },
          select: { id: true, createAt: true },
        });
        lastInteractionDate = createAt;
        messageId = msgId;
      } catch (error) {
        console.error("Error sending message:", error);
        throw new ErrorResponse(500).toast({
          title: "Erro na conexão ao tentar enviar a mensagem.",
          description: "Por favor, verifique a conexão com o WhatsApp.",
          type: "error",
        });
      }
    }

    if (dto.accountId) {
      cacheAccountSocket.get(dto.accountId)?.listSocket?.forEach((sockId) => {
        // isso é só se caso o contato enviar mensagem para o ticket.
        // socketIo.to(sockId).emit(`inbox`, {
        //   accountId: dto.accountId,
        //   departmentId: InboxDepartment.id,
        //   departmentName: InboxDepartment.name,
        //   status: "MESSAGE",
        //   notifyMsc: true,
        //   notifyToast: true,
        //   id: dto.id,
        // });

        socketIo
          .of(`/business-${InboxDepartment.businessId}/inbox`)
          .emit("message", {
            content: {
              id: messageId,
              ...(dto.type === "text" && { text: dto.text, type: "text" }),
            },
            by: "user",
            departmentId: InboxDepartment.id,
            notifyMsc: false,
            notifyToast: false,
            ticketId: dto.id,
            userId: undefined, // caso seja enviado para um usuário.
            lastInteractionDate: lastInteractionDate!,
          });
      });
    }

    return { message: "OK!", status: 201 };
  }
}

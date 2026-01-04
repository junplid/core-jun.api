import { prisma } from "../../adapters/Prisma/client";
import { socketIo } from "../../infra/express";
import { cacheAccountSocket } from "../../infra/websocket/cache";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { ReturnTicketDTO_I } from "./DTO";

export class ReturnTicketUseCase {
  constructor() {}

  async run({ ...dto }: ReturnTicketDTO_I) {
    const exist = await prisma.tickets.findFirst({
      where: {
        id: dto.id,
        ...(dto.accountId && { accountId: dto.accountId }),
        status: "OPEN",
      },
    });

    if (!exist) {
      throw new ErrorResponse(400).container(
        "Não foi possivel encontrar o ticket."
      );
    }

    try {
      const { InboxDepartment, ContactsWAOnAccount, updateAt } =
        await prisma.tickets.update({
          where: { id: dto.id },
          data: { status: "NEW", inboxUserId: null },
          select: {
            id: true,
            InboxDepartment: {
              select: { name: true, id: true, businessId: true },
            },
            ContactsWAOnAccount: { select: { name: true } },
            updateAt: true,
          },
        });

      if (dto.accountId) {
        const isonline = cacheAccountSocket.get(dto.accountId)?.listSocket
          .length;

        socketIo
          .of(`/business-${InboxDepartment.businessId}/inbox`)
          .emit("list", {
            status: "RETURN",
            forceOpen: false,
            departmentId: InboxDepartment.id,
            name: ContactsWAOnAccount.name,
            lastInteractionDate: updateAt,
            id: dto.id,
            userId: undefined, // caso seja enviado para um usuário.
          });
        if (isonline) {
          cacheAccountSocket
            .get(dto.accountId)
            ?.listSocket?.forEach(async (sockId) => {
              socketIo.to(sockId.id).emit(`inbox`, {
                accountId: dto.accountId,
                departmentId: InboxDepartment.id,
                departmentName: InboxDepartment.name,
                status: "RETURN",
                notifyMsc: false,
                id: dto.id,
              });
            });
        }

        if (dto.orderId) {
          const order = await prisma.orders.findFirst({
            where: {
              id: dto.orderId,
              accountId: dto.accountId,
            },
            select: { status: true },
          });

          if (order?.status) {
            cacheAccountSocket
              .get(dto.accountId)
              ?.listSocket?.forEach(async (sockId) => {
                socketIo.to(sockId.id).emit(`order:ticket:return`, {
                  accountId: dto.accountId,
                  status: order.status,
                  ticketId: dto.id,
                  orderId: dto.orderId,
                });
              });
          }
        }
      }

      return {
        message: "OK!",
        status: 201,
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).toast({
        title: "Não foi possivel puxar ticket.",
        type: "error",
      });
    }
  }
}

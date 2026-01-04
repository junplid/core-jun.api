import { prisma } from "../../adapters/Prisma/client";
import { socketIo } from "../../infra/express";
import { cacheAccountSocket } from "../../infra/websocket/cache";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { PickTicketDTO_I } from "./DTO";

export class PickTicketUseCase {
  constructor() {}

  async run({ ...dto }: PickTicketDTO_I) {
    const exist = await prisma.tickets.findFirst({
      where: {
        id: dto.id,
        ...(dto.accountId && { accountId: dto.accountId }),
        status: "NEW",
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
          data: {
            status: "OPEN",
            ...(dto.userId && { inboxUserId: dto.userId }),
          },
          select: {
            id: true,
            InboxDepartment: {
              select: { name: true, id: true, businessId: true },
            },
            ContactsWAOnAccount: {
              select: { name: true },
            },
            updateAt: true,
          },
        });

      if (dto.accountId) {
        cacheAccountSocket
          .get(dto.accountId)
          ?.listSocket?.forEach(async (sockId) => {
            socketIo.to(sockId).emit(`inbox`, {
              accountId: dto.accountId,
              departmentId: InboxDepartment.id,
              departmentName: InboxDepartment.name,
              status: "OPEN",
              notifyMsc: true,
              notifyToast: true,
              id: dto.id,
            });

            socketIo
              .of(`/business-${InboxDepartment.businessId}/inbox`)
              .emit("list", {
                status: "OPEN",
                forceOpen: false,
                departmentId: InboxDepartment.id,
                notifyMsc: true,
                notifyToast: false,
                name: ContactsWAOnAccount.name,
                lastInteractionDate: updateAt,
                id: dto.id,
                userId: undefined,
              });

            if (dto.orderId) {
              const order = await prisma.orders.findFirst({
                where: {
                  id: dto.orderId,
                  accountId: dto.accountId,
                },
                select: { status: true },
              });
              if (order?.status) {
                socketIo.to(sockId).emit(`order:ticket:open`, {
                  accountId: dto.accountId,
                  status: order.status,
                  ticketId: dto.id,
                  orderId: dto.orderId,
                });
              }
            }
          });
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

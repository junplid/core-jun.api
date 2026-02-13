import { prisma } from "../../adapters/Prisma/client";
import { socketIo } from "../../infra/express";
import { webSocketEmitToRoom } from "../../infra/websocket";
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
        "Não foi possivel encontrar o ticket.",
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
        const { departments, player_department } =
          webSocketEmitToRoom().account(dto.accountId);

        departments.math_new_ticket_count(
          {
            departmentId: InboxDepartment.id,
            n: -1,
          },
          [],
        );
        departments.math_open_ticket_count(
          {
            departmentId: InboxDepartment.id,
            n: +1,
          },
          [],
        );

        player_department(InboxDepartment.id).open_ticket_list(
          {
            forceOpen: false,
            departmentId: InboxDepartment.id,
            name: ContactsWAOnAccount.name,
            lastInteractionDate: updateAt,
            id: dto.id,
            userId: undefined,
          },
          [],
        );

        if (dto.orderId) {
          const order = await prisma.orders.findFirst({
            where: {
              id: dto.orderId,
              accountId: dto.accountId,
            },
            select: { status: true },
          });
          if (order?.status) {
            webSocketEmitToRoom().account(dto.accountId).orders.open_ticket(
              {
                status: order.status,
                ticketId: dto.id,
                orderId: dto.orderId,
              },
              [],
            );
          }
        }
      }

      return {
        message: "OK!",
        status: 201,
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: "Não foi possivel puxar ticket.",
        type: "error",
      });
    }
  }
}

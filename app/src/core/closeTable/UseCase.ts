import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CloseTableDTO_I } from "./DTO";

export class CloseTableUseCase {
  constructor() {}

  async run({ accountId, payment_method, tableId }: CloseTableDTO_I) {
    const exist = await prisma.table.findFirst({
      where: { id: tableId, accountId },
      select: {
        id: true,
        name: true,
        Account: { select: { Business: { take: 1, select: { id: true } } } },
        Order: {
          where: { status: "processing" },
          take: 1,
          select: { id: true },
        },
      },
    });

    if (!exist?.id || !exist.Account.Business.length) {
      throw new ErrorResponse(400).container("Mesa não encontrada.");
    }

    if (!exist.Order.length) {
      throw new ErrorResponse(400).toast({
        title: "Essa mesa não tem pedido.",
        type: "error",
      });
    }

    await prisma.table.update({
      where: { id: exist.id },
      data: { status: "AVAILABLE" },
    });

    const order = await prisma.orders.findFirst({
      where: { tableId: exist.id, status: "processing" },
      select: {
        id: true,
        n_order: true,
        name: true,
        menuOnline: { select: { deviceId_app_agent: true, titlePage: true } },
        Items: {
          select: { obs: true, price: true, title: true, side_dishes: true },
        },
        OrderAdjustments: {
          select: {
            amount: true,
            label: true,
            type: true,
          },
        },
      },
    });

    if (!order?.Items.length) {
      if (order?.id) {
        await prisma.orders.delete({ where: { id: order.id } });
      }
      await prisma.table.update({
        where: { id: tableId },
        data: { status: "AVAILABLE" },
      });
      return { status: 200, message: "OK" };
    }

    const total = order.Items.reduce((ac, item) => {
      ac += item.price?.toNumber() || 0;
      return ac;
    }, 0);

    const totalAdjustment = order.OrderAdjustments.reduce((ac, cr) => {
      if (cr.type === "in") ac += cr.amount.toNumber();
      if (cr.type === "out") ac -= cr.amount.toNumber();
      return ac;
    }, 0);

    const net_total = totalAdjustment + total;

    await prisma.orders.update({
      where: { id: order.id },
      data: {
        total,
        payment_method,
        sub_total: total,
        net_total,
        status: "completed",
        completedAt: new Date(),
        payment_made: new Date(),
      },
    });

    await prisma.table.update({
      where: { id: tableId },
      data: { status: "AVAILABLE" },
    });

    return { status: 200, message: "OK" };
  }
}

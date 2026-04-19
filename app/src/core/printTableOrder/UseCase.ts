import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { PrintTableOrderDTO_I } from "./DTO";
import { formatToBRL } from "brazilian-values";
import { webSocketEmitToRoom } from "../../infra/websocket";
import { remove } from "remove-accents";
import { connectedDevices } from "../../infra/websocket/cache";

export class PrintTableOrderUseCase {
  constructor() {}

  async run({ accountId, tableId }: PrintTableOrderDTO_I) {
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

    // prisma.table
    //   .update({
    //     where: { id: exist.id },
    //     data: { status: "AVAILABLE" },
    //   })
    //   .then(undefined)
    //   .catch(undefined);

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
      },
    });

    if (!order?.Items.length) {
      throw new ErrorResponse(400).toast({
        title: "Essa mesa não tem pedido.",
        type: "error",
      });
    }

    const total = order.Items.reduce((ac, item) => {
      ac += item.price?.toNumber() || 0;
      return ac;
    }, 0);

    if (order.menuOnline?.deviceId_app_agent) {
      const socket = connectedDevices.get(order.menuOnline.deviceId_app_agent);
      if (!socket) {
        await prisma.pendingPrints.upsert({
          where: { orderId: order.id },
          create: { orderId: order.id },
          update: {},
        });
        throw new ErrorResponse(400).toast({
          title: "Impressora desconectada. 1",
          description: "Ao conectar, a impressão será feita automaticamente.",
          type: "error",
          placement: "bottom",
          duration: 1500,
        });
      }

      webSocketEmitToRoom()
        .account(accountId)
        .agent_app(order.menuOnline.deviceId_app_agent)
        .print(
          {
            notify: false,
            type: "presencial",
            menu_title: remove(order.menuOnline.titlePage || ""),
            n_order: order.n_order,
            total: formatToBRL(total),
            subtotal: formatToBRL(total),
            adjustments: [],
            name: remove(order.name || ""),
            items: order.Items.map((ii) => {
              return {
                title: remove(ii.title),
                total:
                  (ii.price?.toNumber() || 0) > 0
                    ? formatToBRL(ii.price?.toNumber() || 0)
                    : undefined,
                subs: remove(ii.side_dishes || ""),
                obs: remove(ii.obs?.replace(/^\_(.*)\_$/, "$1") || ""),
              };
            }),
          },
          [],
        );
    } else {
      await prisma.pendingPrints.upsert({
        where: { orderId: order.id },
        create: { orderId: order.id },
        update: {},
      });
      throw new ErrorResponse(400).toast({
        title: "Agente/Impressora não encontrado. 2",
        description: "Ao conectar, a impressão será feita automaticamente.",
        type: "error",
        placement: "bottom",
        duration: 1500,
      });
    }

    return {
      status: 200,
      message: "OK",
    };
  }
}

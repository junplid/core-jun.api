import { GetOrdersDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { formatToBRL } from "brazilian-values";
import { Decimal } from "@prisma/client/runtime/library";

const select = {
  id: true,
  name: true,
  total: true,
  net_total: true,
  data: true,
  priority: true,
  status: true,
  createAt: true,
  n_order: true,
  delivery_address: true,
  payment_method: true,
  actionChannels: true,
  rank: true,
  isDragDisabled: true,
};

interface ItemDraft {
  title: string;
  price: Decimal | null;
  obs: string | null;
  side_dishes: string | null;
}

function formatOrder(itemsDraft: ItemDraft[]): Readonly<string> {
  const itemsText = itemsDraft
    .map((item) => {
      let header = `*${item.title}*`;
      if ((item.price?.toNumber() || 0) > 0) {
        header += `  ${formatToBRL(item.price?.toNumber() || 0)}`;
      }

      const obs = item.obs ? `Obs: _${item.obs}_` : "";

      return [header, item.side_dishes, obs].filter(Boolean).join("\n");
    })
    .join("\n\n");

  return itemsText;
}

export class GetOrdersUseCase {
  constructor() {}

  async run({ limit = 1, ...dto }: GetOrdersDTO_I) {
    try {
      const orders = await prisma.$transaction(
        dto.status.map((status) =>
          prisma.orders.findMany({
            where: {
              status,
              accountId: dto.accountId,
              deleted: false,
              ...(dto.menu && { menuOnline: { uuid: dto.menu } }),
              createAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
            },
            orderBy: { id: "asc" },
            select: {
              ...select,
              delivery_complement: true,
              delivery_cep: true,
              payment_change_to: true,
              delivery_lat: true,
              delivery_lng: true,
              delivery_number: true,
              delivery_reference_point: true,
              connectionIgId: true,
              connectionWAId: true,
              businessId: true,
              sub_total: true,
              description: true,
              origin: true,
              Charges: { select: { status: true } },
              menuOnline: {
                select: {
                  MenuInfo: { select: { lat: true, lng: true } },
                },
              },
              OrderAdjustments: {
                select: { amount: true, label: true, type: true },
              },
              Items: {
                select: {
                  obs: true,
                  price: true,
                  title: true,
                  side_dishes: true,
                },
              },
              ContactsWAOnAccount: {
                select: {
                  ContactsWA: {
                    select: {
                      completeNumber: true,
                      realNumber: true,
                      username: true,
                    },
                  },
                  Tickets: {
                    where: { status: { notIn: ["DELETED", "RESOLVED"] } },
                    select: {
                      ConnectionWA: { select: { name: true, id: true } },
                      ConnectionIg: { select: { ig_username: true } },
                      id: true,
                      InboxDepartment: { select: { name: true } },
                      status: true,
                      Messages: {
                        take: 1,
                        orderBy: { id: "desc" },
                        select: { by: true },
                      },
                    },
                  },
                },
              },
            },
          }),
        ),
      );

      const nextOrders = dto.status.reduce(
        (ac, cr, index) => ({
          ...ac,
          [cr]: orders[index]
            .map(
              ({
                ContactsWAOnAccount,
                connectionIgId,
                connectionWAId,
                rank,
                OrderAdjustments,
                delivery_lat,
                delivery_lng,
                menuOnline,
                Charges, // mostrar status do pagamento.
                data,
                Items,
                ...order
              }) => {
                const dataItems = formatOrder(Items);
                let nextData = dataItems;
                if (data) {
                  nextData += `\n${data}`;
                }

                return {
                  ...order,
                  ...(delivery_lat &&
                    delivery_lng &&
                    menuOnline?.MenuInfo?.lat &&
                    menuOnline.MenuInfo.lng && {
                      link_map:
                        `https://www.google.com/maps/dir/?api=1` +
                        `&origin=${menuOnline?.MenuInfo?.lat},${menuOnline.MenuInfo.lng}` +
                        `&destination=${delivery_lat},${delivery_lng}`,
                    }),
                  data: nextData,
                  charge_status: Charges.length ? Charges[0].status : undefined,
                  sub_total: order.sub_total?.toNumber(),
                  total: order.total?.toNumber(),
                  net_total: order.net_total?.toNumber(),
                  adjustments: OrderAdjustments,
                  ...(connectionWAId && {
                    channel: "baileys",
                    contact:
                      ContactsWAOnAccount?.ContactsWA.realNumber ||
                      ContactsWAOnAccount?.ContactsWA.completeNumber,
                  }),
                  ...(connectionIgId && {
                    channel: "instagram",
                    contact: ContactsWAOnAccount?.ContactsWA.username,
                  }),

                  sequence: rank.toNumber(),
                  ticket:
                    ContactsWAOnAccount?.Tickets.map((tk) => {
                      let connection: any = {};

                      if (tk.ConnectionWA?.name) {
                        connection = {
                          s: !!cacheConnectionsWAOnline.get(
                            tk.ConnectionWA?.id,
                          ),
                          name: tk.ConnectionWA.name,
                          channel: "baileys",
                        };
                      }
                      if (tk.ConnectionIg?.ig_username) {
                        connection = {
                          s: true,
                          name: tk.ConnectionIg.ig_username,
                          channel: "instagram",
                        };
                      }

                      return {
                        connection,
                        id: tk.id,
                        // lastMessage: tk.Messages[0].by,
                        departmentName: tk.InboxDepartment.name,
                        status: tk.status,
                      };
                    }) || [],
                };
              },
            )
            .sort((a, b) => a.sequence - b.sequence),
        }),
        {} as { [x: string]: any },
      );

      return {
        message: "OK!",
        status: 200,
        orders: nextOrders,
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).toast({
        title: "Não foi achar os pedidos.",
        type: "error",
      });
    }
  }
}

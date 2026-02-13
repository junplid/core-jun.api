import { GetOrdersDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";
import { ErrorResponse } from "../../utils/ErrorResponse";

const select = {
  id: true,
  name: true,
  total: true,
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
            },
            orderBy: { id: "asc" },
            select: {
              ...select,
              connectionIgId: true,
              connectionWAId: true,
              businessId: true,
              description: true,
              origin: true,
              ContactsWAOnAccount: {
                select: {
                  ContactsWA: {
                    select: { completeNumber: true, username: true },
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
                ...order
              }) => {
                return {
                  ...order,

                  ...(connectionIgId && {
                    channel: "baileys",
                    contact: ContactsWAOnAccount?.ContactsWA.completeNumber,
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

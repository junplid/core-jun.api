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
              businessId: true,
              description: true,
              origin: true,
              ContactsWAOnAccount: {
                select: {
                  ContactsWA: { select: { completeNumber: true } },
                  Tickets: {
                    where: { status: { notIn: ["DELETED", "RESOLVED"] } },
                    select: {
                      ConnectionWA: { select: { name: true, id: true } },
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
          })
        )
      );

      const nextOrders = dto.status.reduce(
        (ac, cr, index) => ({
          ...ac,
          [cr]: orders[index]
            .map(({ ContactsWAOnAccount, rank, ...order }) => {
              return {
                ...order,
                sequence: rank.toNumber(),
                contact: ContactsWAOnAccount?.ContactsWA.completeNumber,
                ticket:
                  ContactsWAOnAccount?.Tickets.map((tk) => {
                    const isConnected = !!cacheConnectionsWAOnline.get(
                      tk.ConnectionWA.id
                    );
                    return {
                      connection: { ...tk.ConnectionWA, s: isConnected },
                      id: tk.id,
                      // lastMessage: tk.Messages[0].by,
                      departmentName: tk.InboxDepartment.name,
                      status: tk.status,
                    };
                  }) || [],
              };
            })
            .sort((a, b) => a.sequence - b.sequence),
        }),
        {} as { [x: string]: any }
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

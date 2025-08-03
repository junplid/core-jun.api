import { GetOrdersDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetOrdersUseCase {
  constructor() {}

  async run({ page = 1, limit = 1, ...dto }: GetOrdersDTO_I) {
    const where = {
      accountId: dto.accountId,
      deleted: false,
      ...(dto.status && { status: dto.status }),
      ...(dto.priority && { priority: dto.priority }),
      ...(dto.menu && { menuOnline: { uuid: dto.menu } }),
    };

    const [orders, total] = await prisma.$transaction([
      prisma.orders.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: "asc" },
        select: {
          id: true, //
          name: true, //
          total: true, //
          data: true, //  tooltip, quando colocar o mouse por cima vai aparecer o tooltip na esquerda ou direita,
          //              usar o mesmo esquema de modal do no datagrid;
          priority: true, //
          status: true, //
          ContactsWAOnAccount: {
            select: { ContactsWA: { select: { completeNumber: true } } }, //
          },
          createAt: true, //
          n_order: true, //
          delivery_address: true, //
          payment_method: true, //
          actionChannels: true, //
        },
      }),
      prisma.orders.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      message: "OK!",
      status: 200,
      orders: orders.map(({ ContactsWAOnAccount, ...order }) => ({
        ...order,
        contact: ContactsWAOnAccount?.ContactsWA.completeNumber,
      })),
      meta: {
        currentPage: page,
        pageSize: limit,
        total,
        totalPages,
        nextPage: page < totalPages ? page + 1 : null,
      },
    };
  }
}

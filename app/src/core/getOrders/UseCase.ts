import { GetOrdersDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

const select = {
  id: true,
  name: true,
  total: true,
  data: true,
  priority: true,
  status: true,
  ContactsWAOnAccount: {
    select: { ContactsWA: { select: { completeNumber: true } } },
  },
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
          select,
        })
      )
    );

    const nextOrders = dto.status.reduce(
      (ac, cr, index) => ({
        ...ac,
        [cr]: orders[index]
          .map(({ ContactsWAOnAccount, rank, ...order }) => ({
            ...order,
            sequence: rank.toNumber(),
            contact: ContactsWAOnAccount?.ContactsWA.completeNumber,
          }))
          .sort((a, b) => a.sequence - b.sequence),
      }),
      {} as { [x: string]: any }
    );

    return {
      message: "OK!",
      status: 200,
      orders: nextOrders,
    };
  }
}

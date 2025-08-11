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
        [cr]: orders[index].map(
          ({ ContactsWAOnAccount, ...order }, sequence) => ({
            ...order,
            sequence,
            contact: ContactsWAOnAccount?.ContactsWA.completeNumber,
          })
        ),
      }),
      {} as { [x: string]: any }
    );

    return {
      message: "OK!",
      status: 200,
      orders: {
        pending: [],
        confirmed: [
          {
            id: 1,
            name: "Gustavo Oliveira",
            total: 20,
            data: `(1) Pizza Média, sabores:
- Calabresa
- Frango c/ catupiry
OBS: Não colocar cebola`,
            priority: null,
            status: "pending",
            createAt: new Date(),
            n_order: "123456",
            delivery_address: "",
            payment_method: null,
            sequence: 0,
          },
          {
            id: 2,
            name: "Liliam",
            total: 20,
            data: `(1) Pizza Pequena, sabores:
- Calabresa

(1) Coca-Cola em lata`,
            priority: null,
            status: "confirmed",
            createAt: new Date(),
            n_order: "123456",
            delivery_address: "",
            payment_method: null,
            sequence: 0,
          },
        ],
        processing: [
          {
            id: 3,
            name: "Gabriel",
            total: 20,
            data: `(1) Pizza Familia, sabores:
- Calabresa
- Frango c/ catupiry
- Portuguesa

(1) Pepsi 1 litro`,
            priority: null,
            status: "confirmed",
            createAt: new Date(),
            n_order: "123456",
            delivery_address: "",
            payment_method: null,
            sequence: 1,
          },
        ],
      },
    };
  }
}

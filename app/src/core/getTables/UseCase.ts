import { GetTablesDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetTablesUseCase {
  constructor() {}

  async run({ limit = 1, ...dto }: GetTablesDTO_I) {
    try {
      const tabels = await prisma.table.findMany({
        where: { accountId: dto.accountId, name: dto.name },
        select: {
          name: true,
          id: true,
          status: true,
          createAt: true,
          Order: {
            where: { status: "processing" },
            take: 1,
            select: {
              OrderAdjustments: {
                select: { label: true, type: true, amount: true },
              },
              Items: {
                select: {
                  title: true,
                  obs: true,
                  price: true,
                  side_dishes: true,
                },
              },
            },
          },
        },
      });

      return {
        message: "OK!",
        status: 200,
        tables: tabels.map(({ Order, ...table }) => {
          return {
            ...table,
            order: Order.length
              ? {
                  items: Order[0].Items.map((s) => ({
                    ...s,
                    price: s.price?.toNumber(),
                  })),
                  adjustments: Order[0].OrderAdjustments.map((s) => ({
                    ...s,
                    amount: s.amount?.toNumber(),
                  })),
                }
              : null,
          };
        }),
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).toast({
        title: "Error ao tentar buscar mesas.",
        type: "error",
      });
    }
  }
}

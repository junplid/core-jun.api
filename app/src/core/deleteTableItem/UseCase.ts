import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { DeleteTableItemDTO_I } from "./DTO";

export class DeleteTableItemUseCase {
  constructor() {}

  async run({ accountId, ItemOfOrderId, tableId }: DeleteTableItemDTO_I) {
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

    const findItem = await prisma.menuOnlineItemOfOrder.findFirst({
      where: { id: ItemOfOrderId },
      select: { id: true },
    });

    if (!findItem?.id) {
      return { status: 201, message: "OK" };
    }

    await prisma.menuOnlineItemOfOrder.delete({
      where: { id: ItemOfOrderId },
      select: { id: true },
    });
    return { status: 201, message: "OK" };
  }
}

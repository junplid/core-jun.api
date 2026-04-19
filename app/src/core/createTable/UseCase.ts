import { prisma } from "../../adapters/Prisma/client";
import { CreateTableDTO_I } from "./DTO";

export class CreateTableUseCase {
  constructor() {}

  async run({ accountId, ...rest }: CreateTableDTO_I) {
    const newTable = await prisma.table.create({
      data: { ...rest, accountId },
      select: { createAt: true },
    });

    return { status: 201, message: "OK", table: newTable };
  }
}

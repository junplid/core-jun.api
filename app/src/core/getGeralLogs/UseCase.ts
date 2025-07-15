import { GetGeralLogsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetGeralLogsUseCase {
  constructor() {}

  async run(_dto: GetGeralLogsDTO_I) {
    const logs = await prisma.geralLogDate.findMany({
      take: 20,
      orderBy: { createAt: "asc" },
      select: { id: true, type: true, value: true, entity: true, hash: true },
    });

    return { message: "OK!", status: 200, logs };
  }
}

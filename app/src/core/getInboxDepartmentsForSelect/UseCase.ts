import { GetInboxDepartmentsForSelectDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetInboxDepartmentsForSelectUseCase {
  constructor() {}

  async run(dto: GetInboxDepartmentsForSelectDTO_I) {
    const inboxDepartments = await prisma.inboxDepartments.findMany({
      where: { accountId: dto.accountId },
      orderBy: { id: "desc" },
      select: { id: true, name: true, businessId: true },
    });

    return { message: "OK!", status: 200, inboxDepartments };
  }
}

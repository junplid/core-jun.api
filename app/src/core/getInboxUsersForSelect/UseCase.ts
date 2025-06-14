import { GetInboxUserForSelectDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetInboxUserForSelectUseCase {
  constructor() {}

  async run(dto: GetInboxUserForSelectDTO_I) {
    const inboxUsers = await prisma.inboxUsers.findMany({
      where: { accountId: dto.accountId },
      orderBy: { id: "desc" },
      select: { id: true, name: true, inboxDepartmentId: true },
    });

    return { message: "OK!", status: 200, inboxUsers };
  }
}

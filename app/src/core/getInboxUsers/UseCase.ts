import { GetInboxUsersDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetInboxUsersUseCase {
  constructor() {}

  async run(dto: GetInboxUsersDTO_I) {
    const data = await prisma.inboxUsers.findMany({
      where: { accountId: dto.accountId },
      select: {
        id: true,
        name: true,
        createAt: true,
        _count: { select: { Tickets: { where: { status: "OPEN" } } } },
        InboxDepartment: { select: { name: true, id: true } },
      },
    });

    return {
      message: "OK!",
      status: 200,
      inboxUsers: data.map(({ InboxDepartment, _count, ...r }) => ({
        ...r,
        tickets_open: _count.Tickets,
        department: null,
        ...(InboxDepartment && { department: InboxDepartment }),
      })),
    };
  }
}

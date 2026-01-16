import { GetInboxDepartmentsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetInboxDepartmentsUseCase {
  constructor() {}

  async run(dto: GetInboxDepartmentsDTO_I) {
    const data = await prisma.inboxDepartments.findMany({
      where: { accountId: dto.accountId },
      select: {
        id: true,
        name: true,
        createAt: true,
        Tickets: {
          where: { status: { in: ["NEW", "OPEN"] } },
          select: { status: true },
        },
        Business: { select: { id: true, name: true } },
      },
      orderBy: { id: "desc" },
    });

    return {
      message: "OK!",
      status: 200,
      inboxDepartments: data.map(({ Business, Tickets, ...r }) => ({
        ...r,
        tickets_new: Tickets.reduce(
          (acc, ticket) => acc + (ticket.status === "NEW" ? 1 : 0),
          0
        ),
        tickets_open: Tickets.reduce(
          (acc, ticket) => acc + (ticket.status === "OPEN" ? 1 : 0),
          0
        ),
        business: Business,
      })),
    };
  }
}

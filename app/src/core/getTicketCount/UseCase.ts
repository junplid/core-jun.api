import { GetTicketCountDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetTicketCountUseCase {
  constructor() {}

  async run(dto: GetTicketCountDTO_I) {
    const data = await prisma.tickets.count({
      where: {
        ...(dto.accountId && { accountId: dto.accountId }),
        ...(dto.userId && {
          OR: [{ inboxUserId: dto.userId }, { inboxUserId: null }],
        }),
        inboxDepartmentId: dto.id,
        ...(dto.type
          ? { AND: [{ status: dto.type }, { status: { not: "DELETED" } }] }
          : { status: { not: "DELETED" } }),
      },
    });

    return {
      message: "OK!",
      status: 200,
      count: data,
    };
  }
}

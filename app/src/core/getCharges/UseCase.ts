import { GetChargesDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetChargesUseCase {
  constructor() {}

  async run(dto: GetChargesDTO_I) {
    const data = await prisma.charges.findMany({
      where: { accountId: dto.accountId, deleted: false },
      select: {
        id: true,
        createAt: true,
        status: true,
        total: true,
        transactionId: true,
        updatedAt: true,
        provider: true,
        ContactsWAOnAccount: {
          select: {
            name: true,
            id: true,
            ContactsWA: { select: { completeNumber: true } },
          },
        },
        Business: {
          select: { id: true, name: true },
        },
      },
    });

    const charges = data.map(({ ContactsWAOnAccount, Business, ...r }) => {
      return {
        ...r,
        total: r.total.toNumber(),
        business: Business,
        contact: ContactsWAOnAccount
          ? {
              name: ContactsWAOnAccount.name,
              id: ContactsWAOnAccount.id,
              number: ContactsWAOnAccount.ContactsWA.completeNumber,
            }
          : null,
      };
    });

    return { message: "OK!", status: 200, charges };
  }
}

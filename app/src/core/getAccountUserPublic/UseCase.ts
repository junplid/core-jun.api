import { prisma } from "../../adapters/Prisma/client";
import { getCustomerAssas } from "../../services/Assas/Customer";
import { GetAccountUserDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetAccountUserUseCase {
  constructor() {}

  async run(dto: GetAccountUserDTO_I) {
    const account = await prisma.account.findUnique({
      where: { id: dto.accountId },
      select: {
        name: true,
        email: true,
        customerId: true,
        emailVerified: true,
        ContactsWA: { select: { completeNumber: true } },
        createAt: true,
        Plan: { select: { type: true } },
      },
    });

    if (!account) {
      throw new ErrorResponse(401).toast({
        title: `Não autorizado!`,
        type: "error",
      });
    }

    const { customerId, ...account2 } = account;

    const isCustomer = customerId
      ? !!(await getCustomerAssas(customerId))
      : false;

    if (customerId && !isCustomer) {
      await prisma.account.update({
        where: { id: dto.accountId },
        data: {
          customerId: null,
          CreditCardsAccount: {
            deleteMany: { accountId: dto.accountId },
          },
        },
      });
    }

    const nextNumber = account2.ContactsWA.completeNumber.split("");
    if (nextNumber.length === 12) {
      nextNumber.splice(4, 0, "9");
    }

    return {
      message: "OK",
      status: 200,
      account: {
        ...account2,
        number: nextNumber.join(""),
        isCustomer,
        name: account.name ?? account.email,
        id: dto.accountId,
      },
    };
  }
}

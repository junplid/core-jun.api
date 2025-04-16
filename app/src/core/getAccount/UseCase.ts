import { prisma } from "../../adapters/Prisma/client";
import { GetAccountDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetAccountUseCase {
  constructor() {}

  async run(dto: GetAccountDTO_I) {
    const account = await prisma.account.findUnique({
      where: { id: dto.accountId },
      select: {
        name: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!account) {
      throw new ErrorResponse(401).toast({
        title: `Não autorizado!`,
        type: "error",
      });
    }

    // const isCustomer = customerId
    //   ? !!(await getCustomerAssas(customerId))
    //   : false;

    // if (customerId && !isCustomer) {
    //   await prisma.account.update({
    //     where: { id: dto.accountId },
    //     data: {
    //       customerId: null,
    //       CreditCardsAccount: {
    //         deleteMany: { accountId: dto.accountId },
    //       },
    //     },
    //   });
    // }

    // const nextNumber = account2.ContactsWA.completeNumber.split("");
    // if (nextNumber.length === 12) {
    //   nextNumber.splice(4, 0, "9");
    // }

    return {
      message: "OK",
      status: 200,
      account: {
        ...account,
        name: account.name ?? account.email,
      },
    };
  }
}

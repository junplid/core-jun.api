import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetMyAccountDTO_I } from "./DTO";

export class GetMyAccountUseCase {
  constructor() {}

  async run(dto: GetMyAccountDTO_I) {
    const myAccount = await prisma.account.findUnique({
      where: { id: dto.accountId },
      select: {
        email: true,
        ContactsWA: { select: { completeNumber: true } },
        createAt: true,
        name: true,
        customerId: true,
      },
    });

    if (!myAccount) {
      throw new ErrorResponse(401).toast({
        title: `Não authorizado`,
        type: "error",
      });
    }

    const { ContactsWA, customerId, ...rest } = myAccount;

    return {
      message: "OK!",
      status: 200,
      myAccount: {
        ...rest,
        number: ContactsWA.completeNumber,
        isCustomer: !!customerId,
      },
    };
  }
}

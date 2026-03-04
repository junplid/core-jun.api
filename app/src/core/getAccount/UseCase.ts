import { prisma } from "../../adapters/Prisma/client";
import { GetAccountDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { decrypte } from "../../libs/encryption";

export class GetAccountUseCase {
  constructor() {}

  async run(dto: GetAccountDTO_I) {
    try {
      const account = await prisma.account.findUnique({
        where: { id: dto.accountId },
        select: {
          name: true,
          emailEncrypted: true,
          emailVerified: true,
          onboarded: true,
          hash: true,
          isPremium: true,
          Business: { select: { id: true } },
          ContactsWA: { select: { completeNumber: true } },
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
      const { Business, ContactsWA, ...rest } = account;

      let name = "";
      if (rest.name) {
        name = rest.name;
      } else if (rest.emailEncrypted) {
        name = decrypte(rest.emailEncrypted);
      } else if (ContactsWA.completeNumber) {
        name = ContactsWA.completeNumber;
      }

      return {
        message: "OK",
        status: 200,
        account: {
          ...rest,
          isPremium: !!rest.isPremium,
          id: dto.accountId,
          name,
          businessId: Business[0].id,
        },
      };
    } catch (error) {
      console.error("Error in GetAccountUseCase:", error);
      if (error instanceof ErrorResponse) {
        throw error;
      } else {
        throw new ErrorResponse(500).toast({
          title: `Erro ao obter conta!`,
          type: "error",
        });
      }
    }
  }
}

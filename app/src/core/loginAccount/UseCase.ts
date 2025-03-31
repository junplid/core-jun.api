import { LoginAccountDTO_I } from "./DTO";
import { LoginAccountRepository_I } from "./Repository";

import { compare } from "bcrypt";
import { createTokenAuth } from "../../helpers/authToken";
import { getCustomerAssas } from "../../services/Assas/Customer";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class LoginAccountUseCase {
  constructor(private repository: LoginAccountRepository_I) {}

  async run(dto: LoginAccountDTO_I) {
    const account = await this.repository.findAccount({
      email: dto.email,
    });

    if (!account) {
      throw new ErrorResponse(400)
        .container("Dados de acesso incorretos.")
        .toast({ title: "Dados de acesso incorretos.", type: "error" });
    }

    const comparePassword = await compare(dto.password, account.password);

    if (!comparePassword) {
      throw new ErrorResponse(400)
        .container("Dados de acesso incorretos.")
        .toast({ title: "Dados de acesso incorretos.", type: "error" });
    }

    if (account.type === "adm") {
      const isCustomer = account.customerId
        ? !!(await getCustomerAssas(account.customerId))
        : false;

      if (account.customerId && !isCustomer) {
        await prisma.account.update({
          where: { id: account.id },
          data: {
            customerId: null,
            CreditCardsAccount: {
              deleteMany: { accountId: account.id },
            },
          },
        });
      }
    }

    const token = await createTokenAuth(
      {
        ...(account.type === "adm"
          ? { id: account.id, type: account.type, hash: account.hash }
          : { uid: account.uid, type: account.type }),
      },
      "secret123"
    );

    return {
      message: "Login efetuado com sucesso!",
      status: 200,
      token,
      erros: [{}],
    };
  }
}

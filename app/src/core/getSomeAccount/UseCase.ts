import { v4 } from "uuid";
import { prisma } from "../../adapters/Prisma/client";
import { createTokenAuth } from "../../helpers/authToken";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetSomeAccountDTO_I } from "./DTO";
import { GetSomeAccountRepository_I } from "./Repository";

export class GetSomeAccountUseCase {
  constructor(private repository: GetSomeAccountRepository_I) {}

  async run(dto: GetSomeAccountDTO_I) {
    const account = await this.repository.findAccount(dto.accountId);

    if (!account) {
      throw new ErrorResponse(401).toast({
        title: `Não autorizado!`,
        type: "error",
      });
    }

    const hash = v4();
    await prisma.account.update({
      where: { id: dto.accountId },
      data: { hash },
    });

    const ntoken = await createTokenAuth(
      { id: dto.accountId, type: "adm", hash },
      "recover-password-whabot-confirm"
    );

    return { message: "OK", status: 200, ntoken };
  }
}

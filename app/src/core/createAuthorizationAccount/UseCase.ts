import { createTokenAuth } from "../../helpers/authToken";
import { CreateAuthorizationAccountDTO_I } from "./DTO";
import { CreateAuthorizationAccountRepository_I } from "./Repository";

export class CreateAuthorizationAccountUseCase {
  constructor(private repository: CreateAuthorizationAccountRepository_I) {}

  async run(dto: CreateAuthorizationAccountDTO_I) {
    const alreadyExists = await this.repository.fetch(dto);

    const privateKey = await createTokenAuth(
      {
        type: "api-ondemand",
        id: dto.accountId,
      },
      "secret123"
    );

    await this.repository.create({
      accountId: dto.accountId,
      privateKey,
      id: alreadyExists?.id,
    });

    return { message: "OK!", status: 201, privateKey };
  }
}

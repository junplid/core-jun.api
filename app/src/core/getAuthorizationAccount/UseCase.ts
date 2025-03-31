import { GetAuthorizationAccountRepository_I } from "./Repository";
import { GetAuthorizationAccountDTO_I } from "./DTO";

export class GetAuthorizationAccountUseCase {
  constructor(private repository: GetAuthorizationAccountRepository_I) {}

  async run(dto: GetAuthorizationAccountDTO_I) {
    const accountAuthorization = await this.repository.fetch({
      accountId: dto.accountId,
    });

    return {
      message: "OK!",
      status: 201,
      accountAuthorization,
    };
  }
}

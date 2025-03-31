import { GetBusinessIdOnAccountRepository_I } from "./Repository";
import { GetBusinessIdOnAccountDTO_I } from "./DTO";

export class GetBusinessIdOnAccountUseCase {
  constructor(private repository: GetBusinessIdOnAccountRepository_I) {}

  async run(dto: GetBusinessIdOnAccountDTO_I) {
    const business = await this.repository.fetch(dto);

    return {
      message: "OK!",
      status: 200,
      business,
    };
  }
}

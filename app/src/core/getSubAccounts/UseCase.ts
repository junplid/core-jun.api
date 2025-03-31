import { GetSubAccountsDTO_I } from "./DTO";
import { GetSubAccountsRepository_I } from "./Repository";

export class GetSubAccountsUseCase {
  constructor(private repository: GetSubAccountsRepository_I) {}

  async run(dto: GetSubAccountsDTO_I) {
    return {
      message: "OK!",
      status: 200,
      users: await this.repository.fetch(dto),
    };
  }
}

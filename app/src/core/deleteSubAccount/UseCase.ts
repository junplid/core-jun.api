import { DeleteSubAccountDTO_I } from "./DTO";
import { DeleteSubAccountRepository_I } from "./Repository";

export class DeleteSubAccountUseCase {
  constructor(private repository: DeleteSubAccountRepository_I) {}

  async run(dto: DeleteSubAccountDTO_I) {
    await this.repository.delete(dto);

    return {
      message: "OK!",
      status: 200,
    };
  }
}

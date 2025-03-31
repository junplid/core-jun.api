import { GetParametersOnAccountForSelectRepository_I } from "./Repository";
import { GetParametersOnAccountForSelectDTO_I } from "./DTO";

export class GetParametersOnAccountForSelectUseCase {
  constructor(
    private repository: GetParametersOnAccountForSelectRepository_I
  ) {}

  async run(dto: GetParametersOnAccountForSelectDTO_I) {
    const parameters = await this.repository.fetch({
      accountId: dto.accountId,
    });

    return {
      message: "OK!",
      status: 200,
      parameters,
    };
  }
}

import { GetVariableForSelectRepository_I } from "./Repository";
import { GetVariableForSelectDTO_I } from "./DTO";

export class GetVariableForSelectUseCase {
  constructor(private repository: GetVariableForSelectRepository_I) {}

  async run(dto: GetVariableForSelectDTO_I) {
    const tags = await this.repository.get(dto);

    return {
      message: "OK!",
      status: 200,
      tags,
    };
  }
}

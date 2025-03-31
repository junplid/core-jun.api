import { GetTagForSelectRepository_I } from "./Repository";
import { GetTagForSelectDTO_I } from "./DTO";

export class GetTagForSelectUseCase {
  constructor(private repository: GetTagForSelectRepository_I) {}

  async run(dto: GetTagForSelectDTO_I) {
    const tags = await this.repository.get(dto);

    return {
      message: "OK!",
      status: 200,
      tags,
    };
  }
}

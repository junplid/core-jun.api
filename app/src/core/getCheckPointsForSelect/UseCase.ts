import { GetCheckPointsForSelectRepository_I } from "./Repository";
import { GetCheckPointsForSelectDTO_I } from "./DTO";

export class GetCheckPointsForSelectUseCase {
  constructor(private repository: GetCheckPointsForSelectRepository_I) {}

  async run(dto: GetCheckPointsForSelectDTO_I) {
    const data = await this.repository.fetch(dto);

    return {
      message: "OK!",
      status: 200,
      checkpoints: data,
    };
  }
}

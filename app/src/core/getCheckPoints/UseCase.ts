import { GetCheckPointsRepository_I } from "./Repository";
import { GetCheckPointsDTO_I } from "./DTO";

export class GetCheckPointsUseCase {
  constructor(private repository: GetCheckPointsRepository_I) {}

  async run(dto: GetCheckPointsDTO_I) {
    const data = await this.repository.fetch(dto);

    return {
      message: "OK!",
      status: 200,
      checkpoints: data,
    };
  }
}

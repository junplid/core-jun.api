import { GetRootPlansForSelectDTO_I } from "./DTO";
import { GetRootPlansForSelectRepository_I } from "./Repository";

export class GetRootPlansForSelectUseCase {
  constructor(private repository: GetRootPlansForSelectRepository_I) {}

  async run(dto: GetRootPlansForSelectDTO_I) {
    return {
      message: "OK!",
      status: 200,
      plans: await this.repository.fetch(),
    };
  }
}

import { GeSupervisorsForSelectRepository_I } from "./Repository";
import { GeSupervisorsForSelectDTO_I } from "./DTO";

export class GeSupervisorsForSelectUseCase {
  constructor(private repository: GeSupervisorsForSelectRepository_I) {}

  async run(dto: GeSupervisorsForSelectDTO_I) {
    const supervisors = await this.repository.fetch(dto);

    return {
      message: "OK!",
      status: 200,
      supervisors,
    };
  }
}

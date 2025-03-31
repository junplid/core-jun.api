import { GetAudienceOnAccountForSelectRepository_I } from "./Repository";
import { GetAudienceOnAccountForSelectDTO_I } from "./DTO";

export class GetAudienceOnAccountForSelectUseCase {
  constructor(private repository: GetAudienceOnAccountForSelectRepository_I) {}

  async run(dto: GetAudienceOnAccountForSelectDTO_I) {
    const audience = await this.repository.fetch(dto);

    return {
      message: "OK!",
      status: 200,
      audience,
    };
  }
}

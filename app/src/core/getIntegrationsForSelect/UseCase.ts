import { GetIntegrationsForSelectDTO_I } from "./DTO";
import { GetIntegrationsForSelectRepository_I } from "./Repository";

export class GetIntegrationsForSelectUseCase {
  constructor(private repository: GetIntegrationsForSelectRepository_I) {}

  async run(dto: GetIntegrationsForSelectDTO_I) {
    const integrations = await this.repository.get(dto);

    return {
      message: "OK!",
      status: 200,
      integrations,
    };
  }
}

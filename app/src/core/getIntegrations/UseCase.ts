import { GetIntegrationsDTO_I } from "./DTO";
import { GetIntegrationsRepository_I } from "./Repository";

export class GetIntegrationsUseCase {
  constructor(private repository: GetIntegrationsRepository_I) {}

  async run(dto: GetIntegrationsDTO_I) {
    const integrations = await this.repository.fetchContactWAOnAccount({
      accountId: dto.accountId,
    });

    return {
      message: "OK!",
      status: 200,
      integrations,
    };
  }
}

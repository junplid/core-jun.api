import { DeleteEmailServiceConfigurationRepository_I } from "./Repository";
import { DeleteEmailServiceConfigurationDTO_I } from "./DTO";

export class DeleteEmailServiceConfigurationUseCase {
  constructor(
    private repository: DeleteEmailServiceConfigurationRepository_I
  ) {}

  async run(dto: DeleteEmailServiceConfigurationDTO_I) {
    await this.repository.delete(dto);

    return {
      message: "OK!",
      status: 200,
    };
  }
}

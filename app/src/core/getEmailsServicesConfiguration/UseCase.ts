import { GetEmailsServicesConfigurationDTO_I } from "./DTO";
import { GetEmailsServicesConfigurationRepository_I } from "./Repository";

export class GetEmailsServicesConfigurationUseCase {
  constructor(private repository: GetEmailsServicesConfigurationRepository_I) {}

  async run(dto: GetEmailsServicesConfigurationDTO_I) {
    const emailServices = await this.repository.fetch(dto);

    return {
      message: "OK!",
      status: 200,
      emailServices,
    };
  }
}

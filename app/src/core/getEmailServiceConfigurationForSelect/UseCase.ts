import { GetEmailServiceConfigurationForSelectForSelectDTO_I } from "./DTO";
import { GetEmailServiceConfigurationForSelectRepository_I } from "./Repository";

export class GetEmailServiceConfigurationForSelectUseCase {
  constructor(
    private repository: GetEmailServiceConfigurationForSelectRepository_I
  ) {}

  async run(dto: GetEmailServiceConfigurationForSelectForSelectDTO_I) {
    const emailServices = await this.repository.fetch(dto);

    return {
      message: "OK!",
      status: 200,
      emailServices,
    };
  }
}

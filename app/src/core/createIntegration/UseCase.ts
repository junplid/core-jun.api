import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateIntegrationDTO_I } from "./DTO";
import { CreateIntegrationRepository_I } from "./Repository";

export class CreateIntegrationUseCase {
  constructor(private repository: CreateIntegrationRepository_I) {}

  async run(dto: CreateIntegrationDTO_I) {
    const exist = await this.repository.fetchExist(dto);

    if (exist) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: `Já existe Integração com esse nome`,
      });
    }

    const integration = await this.repository.create(dto);

    return {
      message: "OK!",
      status: 201,
      integration,
    };
  }
}

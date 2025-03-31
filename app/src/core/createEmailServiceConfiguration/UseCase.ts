import { CreateEmailServiceConfigurationRepository_I } from "./Repository";
import { CreateEmailServiceConfigurationDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateEmailServiceConfigurationUseCase {
  constructor(
    private repository: CreateEmailServiceConfigurationRepository_I
  ) {}

  async run(dto: CreateEmailServiceConfigurationDTO_I) {
    const exist = await this.repository.fetchExist({
      accountId: dto.accountId,
      host: dto.host,
      user: dto.user,
      businessIds: dto.businessIds,
    });

    if (exist) {
      throw new ErrorResponse(400).toast({
        title: "Serviço de e-mail já existe!",
        type: "error",
      });
    }

    const data = await this.repository.create(dto);

    return {
      message: "OK!",
      status: 201,
      ...data,
    };
  }
}

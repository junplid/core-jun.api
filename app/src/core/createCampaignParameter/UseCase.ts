import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateParameterDTO_I } from "./DTO";
import { CreateParameterRepository_I } from "./Repository";

export class CreateParameterUseCase {
  constructor(private repository: CreateParameterRepository_I) {}

  async run(dto: CreateParameterDTO_I) {
    const isExist = await this.repository.fetchExist({
      accountId: dto.accountId,
      name: dto.name,
    });

    if (isExist) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Já existe parâmetro com esse nome",
      });
    }

    const { campaignParameterId, createAt } = await this.repository.create({
      ...dto,
    });

    return {
      message: "Parâmetro criado com sucesso!",
      status: 201,
      campaignParameterId,
      createAt,
    };
  }
}

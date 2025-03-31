import { DeleteCampaignParameterRepository_I } from "./Repository";
import { DeleteCampaignParameterDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class DeleteCampaignParameterUseCase {
  constructor(private repository: DeleteCampaignParameterRepository_I) {}

  async run(dto: DeleteCampaignParameterDTO_I) {
    const isExist = await this.repository.fetchExist(dto);

    if (!isExist) {
      throw new ErrorResponse(400).toast({
        title: `Parametro de campanha não encontrado`,
        type: "error",
      });
    }

    await this.repository.delete(dto);

    return {
      message: "Parâmetro removido com sucesso!",
      status: 200,
    };
  }
}

import { DeleteCampaignAudienceRepository_I } from "./Repository";
import { DeleteCampaignAudienceDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class DeleteCampaignAudienceUseCase {
  constructor(private repository: DeleteCampaignAudienceRepository_I) {}

  async run(dto: DeleteCampaignAudienceDTO_I) {
    const fetchExist = await this.repository.fetchExist(dto);

    if (!fetchExist) {
      throw new ErrorResponse(400).toast({
        title: `Publico de Campanha não encontrado`,
        type: "error",
      });
    }

    await this.repository.delete(dto);

    return {
      message: "OK!",
      status: 200,
    };
  }
}

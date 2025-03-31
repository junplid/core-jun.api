import { GetCampaignParameterRepository_I } from "./Repository";
import { GetCampaignParameterDTO_I } from "./DTO";

export class GetCampaignParameterUseCase {
  constructor(private repository: GetCampaignParameterRepository_I) {}

  async run(dto: GetCampaignParameterDTO_I) {
    const campaignParameters = await this.repository.get(dto);

    return {
      message: "OK!",
      status: 200,
      campaignParameters,
    };
  }
}

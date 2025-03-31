import { GetCampaignAudienceForSelectRepository_I } from "./Repository";
import { GetCampaignAudienceForSelectDTO_I } from "./DTO";

export class GetCampaignAudienceForSelectUseCase {
  constructor(private repository: GetCampaignAudienceForSelectRepository_I) {}

  async run(dto: GetCampaignAudienceForSelectDTO_I) {
    const data = await this.repository.fetch(dto);

    return {
      message: "OK!",
      status: 200,
      campaignAudiences: data,
    };
  }
}

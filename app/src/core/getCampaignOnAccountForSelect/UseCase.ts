import { GetCampaignOnAccountForSelectRepository_I } from "./Repository";
import { GetCampaignOnAccountForSelectDTO_I } from "./DTO";

export class GetCampaignOnAccountForSelectUseCase {
  constructor(private repository: GetCampaignOnAccountForSelectRepository_I) {}

  async run(dto: GetCampaignOnAccountForSelectDTO_I) {
    const campaigns = await this.repository.fetch(dto);

    return {
      message: "OK!",
      status: 200,
      campaigns,
    };
  }
}

import { CreateAggregationCampaignAudienceRepository_I } from "./Repository";
import { CreateAggregationCampaignAudienceDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateAggregationCampaignAudienceUseCase {
  constructor(
    private repository: CreateAggregationCampaignAudienceRepository_I
  ) {}

  async run(dto: CreateAggregationCampaignAudienceDTO_I) {
    try {
      const aggregation = await this.repository.fetch(dto);
      return {
        message: "OK",
        status: 200,
        aggregation,
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: "Error ao tentar aggregar dados",
        type: "error",
      });
    }
  }
}

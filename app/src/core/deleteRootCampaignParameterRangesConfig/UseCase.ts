import { DeleteRootCampaignParameterRangesConfigRepository_I } from "./Repository";
import { DeleteRootCampaignParameterRangesConfigDTO_I } from "./DTO";

export class DeleteRootCampaignParameterRangesConfigUseCase {
  constructor(
    private repository: DeleteRootCampaignParameterRangesConfigRepository_I
  ) {}

  async run(dto: DeleteRootCampaignParameterRangesConfigDTO_I) {
    const isAlreadyExists = await this.repository.isAlreadyExists(dto);
    if (isAlreadyExists) {
      this.repository.del(dto);
    }

    return {
      message: "OK!",
      status: 200,
    };
  }
}

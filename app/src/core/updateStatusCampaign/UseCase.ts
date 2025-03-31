import { UpdateStatusCampaignRepository_I } from "./Repository";
import { UpdateStatusCampaignDTO_I } from "./DTO";
import { resolve } from "path";
import { removeSync } from "fs-extra";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class UpdateStatusCampaignUseCase {
  constructor(private repository: UpdateStatusCampaignRepository_I) {}

  async run(dto: UpdateStatusCampaignDTO_I) {
    const campaign = await this.repository.fetch(dto);

    if (!campaign) {
      throw new ErrorResponse(400).toast({
        title: `Campanha não encontrada!`,
        type: "error",
      });
    }

    await this.repository.update(dto);

    const pathCampaigns = resolve(
      __dirname,
      `../../bin/instructions/account-${dto.accountId}/campaigns`
    );
    removeSync(`${pathCampaigns}/camp_${dto.id}.ts`);

    return {
      message: "OK!",
      status: 200,
    };
  }
}

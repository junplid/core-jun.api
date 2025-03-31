import { DeleteCampaignRepository_I } from "./Repository";
import { DeleteCampaignDTO_I } from "./DTO";
import { resolve } from "path";
import { writeFile, removeSync } from "fs-extra";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class DeleteCampaignUseCase {
  constructor(private repository: DeleteCampaignRepository_I) {}

  async run(dto: DeleteCampaignDTO_I) {
    const exist = await this.repository.fetchExist(dto);

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Campanha não encontrada!`,
        type: "error",
      });
    }

    await this.repository.delete(dto);
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

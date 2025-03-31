import { GetRootCampaignParameterRangesConfigRepository_I } from "./Repository";
import { GetRootCampaignParameterRangesConfigDTO_I } from "./DTO";

export class GetRootCampaignParameterRangesConfigUseCase {
  constructor(
    private repository: GetRootCampaignParameterRangesConfigRepository_I
  ) {}

  async run(dto: GetRootCampaignParameterRangesConfigDTO_I) {
    const data = await this.repository.fetch();
    const daySeconds = 1000 * 60 * 60 * 24;

    const campaignParameterRanges = data.map((cp) => {
      const amountShortsDay = daySeconds / (cp.timeForShorts * 1000);
      const quantasVezesIraDescansarEmUmDia = amountShortsDay / cp.amountShorts;
      const totalTimeResting =
        quantasVezesIraDescansarEmUmDia * (cp.timeRest * 1000);
      const totalTimeWorking = Math.abs(totalTimeResting - daySeconds);
      const shotsPerDay = totalTimeWorking / (cp.timeForShorts * 1000);

      return { ...cp, shotsPerDay };
    });

    return {
      message: "OK!",
      status: 201,
      campaignParameterRanges,
    };
  }
}

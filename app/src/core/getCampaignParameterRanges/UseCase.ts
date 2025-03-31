import { GetCampaignParameterRangesRepository_I } from "./Repository";
import { GetCampaignParameterRangesDTO_I } from "./DTO";

export class GetCampaignParameterRangesUseCase {
  constructor(private repository: GetCampaignParameterRangesRepository_I) {}

  async run(dto: GetCampaignParameterRangesDTO_I) {
    const data = await this.repository.fetch();
    const daySeconds = 1000 * 60 * 60 * 24;

    const campaignParameterRanges = data.map(
      ({ name, id, sequence, ...cp }) => {
        const amountShortsDay = daySeconds / (cp.timeForShorts * 1000);
        const quantasVezesIraDescansarEmUmDia =
          amountShortsDay / cp.amountShorts;
        const totalTimeResting =
          quantasVezesIraDescansarEmUmDia * (cp.timeRest * 1000);
        const totalTimeWorking = Math.abs(totalTimeResting - daySeconds);
        const shotsPerDay = totalTimeWorking / (cp.timeForShorts * 1000);

        return {
          name,
          id,
          sequence,
          shotsPerDay,
        };
      }
    );

    return {
      message: "OK!",
      status: 201,
      campaignParameterRanges,
    };
  }
}

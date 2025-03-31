import { GetCampaignAudienceController } from "./Controller";
import { GetCampaignAudienceUseCase } from "./UseCase";

export const getCampaignAudienceController = GetCampaignAudienceController(
  new GetCampaignAudienceUseCase()
).execute;

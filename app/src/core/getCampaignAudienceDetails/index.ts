import { GetCampaignAudienceDetailsController } from "./Controller";
import { GetCampaignAudienceDetailsUseCase } from "./UseCase";

export const getCampaignAudienceDetailsController =
  GetCampaignAudienceDetailsController(
    new GetCampaignAudienceDetailsUseCase()
  ).execute;

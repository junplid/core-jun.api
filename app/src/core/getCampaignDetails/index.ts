import { GetCampaignDetailsController } from "./Controller";
import { GetCampaignDetailsUseCase } from "./UseCase";

export const getCampaignDetailsController = GetCampaignDetailsController(
  new GetCampaignDetailsUseCase()
).execute;

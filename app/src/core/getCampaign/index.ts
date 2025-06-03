import { GetCampaignController } from "./Controller";
import { GetCampaignUseCase } from "./UseCase";

export const getCampaignController = GetCampaignController(
  new GetCampaignUseCase()
).execute;

import { UpdateCampaignController } from "./Controller";
import { UpdateCampaignUseCase } from "./UseCase";

export const updateCampaignController = UpdateCampaignController(
  new UpdateCampaignUseCase()
).execute;

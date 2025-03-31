import { UpdateCampaignParameterController } from "./Controller";
import { UpdateCampaignParameterUseCase } from "./UseCase";

export const updateCampaignParameterController =
  UpdateCampaignParameterController(
    new UpdateCampaignParameterUseCase()
  ).execute;

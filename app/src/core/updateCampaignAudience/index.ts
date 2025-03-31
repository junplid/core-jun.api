import { UpdateCampaignAudienceController } from "./Controller";
import { UpdateCampaignAudienceUseCase } from "./UseCase";

export const updateCampaignAudienceController =
  UpdateCampaignAudienceController(new UpdateCampaignAudienceUseCase()).execute;

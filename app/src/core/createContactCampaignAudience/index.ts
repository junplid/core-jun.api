import { CreateContactCampaignAudienceController } from "./Controller";
import { CreateContactCampaignAudienceUseCase } from "./UseCase";

export const createContactCampaignAudienceController =
  CreateContactCampaignAudienceController(
    new CreateContactCampaignAudienceUseCase()
  ).execute;

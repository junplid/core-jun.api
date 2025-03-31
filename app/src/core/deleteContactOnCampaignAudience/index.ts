import { DeleteContactOnCampaignAudienceOnAccountController } from "./Controller";
import { DeleteContactOnCampaignAudienceUseCase } from "./UseCase";

export const deleteContactOnCampaignAudienceController =
  DeleteContactOnCampaignAudienceOnAccountController(
    new DeleteContactOnCampaignAudienceUseCase()
  ).execute;

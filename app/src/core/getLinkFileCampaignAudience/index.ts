import { GetLinkFileCampaignAudienceController } from "./Controller";
import { GetLinkFileCampaignAudienceUseCase } from "./UseCase";

export const getLinkFileCampaignAudienceController =
  GetLinkFileCampaignAudienceController(
    new GetLinkFileCampaignAudienceUseCase()
  ).execute;

import { GetFileCampaignAudienceController } from "./Controller";
import { GetFileCampaignAudienceUseCase } from "./UseCase";

export const getFileCampaignAudienceController =
  GetFileCampaignAudienceController(
    new GetFileCampaignAudienceUseCase()
  ).execute;

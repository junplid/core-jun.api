import { GetCampaignOndemandController } from "./Controller";
import { GetCampaignOndemandUseCase } from "./UseCase";

export const getCampaignOndemandController = GetCampaignOndemandController(
  new GetCampaignOndemandUseCase()
).execute;

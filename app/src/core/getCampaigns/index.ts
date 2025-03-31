import { GetCampaignsController } from "./Controller";
import { GetCampaignsUseCase } from "./UseCase";

export const getCampaignsController = GetCampaignsController(
  new GetCampaignsUseCase()
).execute;
